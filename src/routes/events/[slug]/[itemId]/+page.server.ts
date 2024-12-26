// Credits : https://www.youtube.com/watch?v=vHHLLJA0b70&t=13141s


import type { Component } from '$lib/types';
import { API, default_event, events, POST, pre_components } from '$lib';
import { compile } from "svelte/compiler";
import { compile as mdcompile } from "mdsvex"
import { build } from 'esbuild';
import type { PageServerLoad } from './$types';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
    if (params.slug != process.env.pass) {
        throw error(404, { message: "Wrong Password" })
    }
    if (params.itemId === "new") {
        if (!url.searchParams.has('type')) {    
            throw error(404, "required type")
        }
        const event_type = url.searchParams.get('type')
        const res = await POST(API.nextEventid, {
            "type": event_type,
            // "password": "Petrichor" 
            "password": process.env.pass
        })
        const result = await res.json()
        if (result.status != 200) {
            throw error(404, { message: 'Unable to resolve the response: ' + result.message })
        }
        default_event.eventId = `${event_type?.at(0)}F${result.data.toString().padStart(2, '0')}`
        // default_event.markdown = fs.readFileSync(path.resolve('./src/routes/events/[slug]/[itemId]/_page.svx')).toString()
        return {
            "event": default_event,
            "type": "new",
            "pass": params.slug
        }
    }

    const res = await POST(API.getEvent, {
        "id": params.itemId,
        // "password": "Petrichor" 
        "password": process.env.pass
    })
    const result = await res.json()

    if (result.status != 200) {
        throw error(404, { message: 'Unable to resolve the response: ' + result.message })
    }
    return { event: result, "type": "old", "pass": params.slug }
};


const CDN_URL = "https://cdn.jsdelivr.net/npm";

const components_map: Map<string, Component> = new Map()


function generate_lookup(components: Component[]) {
    components.forEach(component => {
        components_map.set(`./${component.name}.${component.type}`, component)
    })
}

async function fetch_package(url: string): Promise<string> {
    if (url.includes("disclose-version")) {
        return ""
    }
    return ((await fetch(url)).text())
}

export const actions = {
    convert: async ({ request }) => {
        const markdown = await request.text();
        generate_lookup([
            ...pre_components,
            {
                id: 100,
                name: 'markdown',
                source: markdown,
                type: 'mdx',
            },
        ]);

        const plugins = [
            {
                name: 'esbuild-plugin',
                setup(build) {
                    build.onResolve({ filter: /.*/ }, (args) => {
                        if (args.path === 'svelte') {
                            // console.log("J", args)
                            return { path: `${CDN_URL}/svelte/internal/index.mjs`, namespace: 'cdn' };
                        }
                        if (args.path.startsWith('svelte/')) {
                            return { path: `${CDN_URL}/svelte/${args.path.slice(7)}/index.mjs`, namespace: 'cdn' };
                        }
                        // console.log("bye")
                        if (components_map.has(args.path)) {
                            return { path: args.path, namespace: 'components' };
                        }
                        return null;
                    });

                    build.onLoad({ filter: /.*/, namespace: 'components' }, async (args) => {
                        // console.log("resolved", args)
                        const component = components_map.get(args.path);
                        if (component?.type == "mdx") {
                            // console.log("ll", args)
                            const source = components_map.get(args.path)?.source || '';
                            const mkCompiled = await mdcompile(source, {});
                            // console.log("Here------")
                            const compiled = compile(mkCompiled.code, { generate: 'dom' });
                            const finalCode = compiled.js.code.replace('import "svelte/internal/disclose-version";', '');
                            return { contents: finalCode, loader: 'js' };
                        } else {
                            const source = components_map.get(args.path)?.source || '';
                            const compiled = compile(source, { generate: 'dom' });
                            const finalCode = compiled.js.code.replace('import "svelte/internal/disclose-version";', '');
                            return { contents: finalCode, loader: 'js' };
                        }
                        // return { contents: component?.source, namespace: component?.type };
                    });

                    build.onLoad({ filter: /.*/, namespace: 'cdn' }, async (args) => {
                        const response = await fetch(args.path);
                        return { contents: await response.text() };
                    });
                },
            },
        ];
        let isError = false;
            const result = await build({
                entryPoints: ['./markdown.mdx'],
                bundle: true,
                format: 'esm',
                plugins,
                write: false,
            }).catch(e => {
                isError = true
                return {
                    outputFiles:[{
                        text: `<p>${e.message}</p>`
                    }]
                }
            });
            return JSON.stringify({"data":result.outputFiles[0].text, isError});

    },

    update: async ({ request }) => {
        let formData = await request.formData();

        // Extracting fields from formData
        const eventId = formData.get('eventId');
        const name = formData.get('name');
        const fee = formData.get('fee');
        const maxMember = formData.get('maxMember');
        const minMember = formData.get('minMember');
        const isTeam = formData.get('isTeam');
        const markdown = formData.get('markdown');
        const image_url = formData.get('image_url');
        const previous_organizers = JSON.parse(formData.get('previous_organizers'));

        // Validation
        if (!eventId || !name || !fee || !maxMember || !minMember || !isTeam) {
            return fail(400, { message: 'All fields are required.' });
        }
        
        if (!image_url || image_url == "") {
            return fail(400, { message: 'Image url not provided' });
        }

        if (isNaN(Number(fee))) {
            return fail(400, { message: 'Fee must be a valid number.' });
        }

        if (isNaN(Number(maxMember)) || isNaN(Number(minMember))) {
            return fail(400, { message: 'MaxMember and MinMember must be valid numbers.' });
        }

        if (!['true', 'false'].includes(isTeam.toString().toLowerCase())) {
            return fail(400, { message: 'isTeam must be "true" or "false".' });
        }

        const organizers = formData.entries()
        const organizers_buffer = new Map()

        for (const organizer of organizers) {
            const [key, file] = organizer
            if (key.startsWith('organizers')) {
                if (file.name === "" && key.endsWith("new")) {
                    return fail(404, { message: 'Please provide an image for ' + key.substring(0,key.length - 3) });
                }
                const name = formData.get(`name_${key}`)?.toString()
                const to_overwrite = formData.get(`overwrite_${key}`) == "on"

                if (!name || name == "") {
                    return fail(404, { message: 'Please provide name for ' + key });
                }
                if ((Array.from(organizers_buffer.keys()).some(existingName => existingName.toLowerCase() === name.toLowerCase()))) {
                    return fail(404, { message: 'Duplicate Organizer name'});
                }

                if (!key.endsWith("new") ) {
                    const old_name = previous_organizers[key]
                    if (file.name == "") {
                        organizers_buffer.set(name, {
                            "buffer": "",
                            "old_name": old_name
                        })
                    } else if (to_overwrite){
                        const buffer = Buffer.from(await file.arrayBuffer());
                        organizers_buffer.set(name, {
                            "buffer": buffer,
                            "old_name": old_name
                        })
                    } else {
                        organizers_buffer.set(name, {
                            "buffer": "",
                            "old_name": name
                        })
                    }
                }
                else {
                    // Convert the file to a buffer and save it
                    const buffer = Buffer.from(await file.arrayBuffer());
                    organizers_buffer.set(name,{
                        "buffer": buffer,
                        "old_name": ""
                    })
                }
            }
        }

        let url = API.updateEvent
        if (formData.get('type') == "new") {
            url = API.addEvent
        }


        const res = POST(url, {
            "eventId": eventId,
            "fee": fee,
            "minMember": minMember,
            "maxMember": maxMember,
            "name": name,
            "isTeam": isTeam == "true",
            "markdown": markdown,
            "image_url": image_url,
            "organizers": organizers_buffer.entries().toArray(),
            // "password" : "Petrichor"
            "password": process.env.pass
        })
            .then(res => res.json())
            .catch(err => {
                console.log(err.toString())
                return fail(500, { message: 'Failed to fetch response' })
            })

        return res
    }


}