// Credits : https://www.youtube.com/watch?v=vHHLLJA0b70&t=13141s


import type { Component } from '$lib/types';
import { API, default_event, POST, pre_components } from '$lib';
import {compile} from  "svelte/compiler";
import { compile as mdcompile } from "mdsvex"
import { rollup } from 'rollup';

import type { PageServerLoad } from './$types';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
    if (params.slug != process.env.pass) {
        throw error(404, {message: "Wrong Password"})
    }
    if (params.itemId === "new") {
        return {
            "event": default_event,
            "type": "new"
        }
    }
    
    const res = await POST(API.getEvent,{
        "id":params.itemId,
        // "password": "Petrichor" 
        "password": process.env.pass 
    })
    const result = await res.json()
    
    if (result.status != 200){
        throw error(404, {message: 'Unable to resolve the response: ' + result.message})
    }
    return {event: result, "type": "old", "pass": params.slug}
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
        // console.log(markdown)
        generate_lookup([...pre_components, {
            id: 100,
            name: 'markdown',
            source: markdown,
            type: 'mdx'
        }])
        const bundle = await rollup({
            input: "./markdown.mdx",
            plugins: [
                {
                    name: 'repl-plugin',
                    resolveId(this, importee: string, importer?: string, options?: { 
                        attributes: Record<string, string>; 
                        custom?: CustomPluginOptions; 
                        isEntry: boolean; 
                    }) {
                        // Handle imports from 'svelte'
                        if (importer === "./Component.svelte") {
                            if (importee.endsWith("disclose-version")) return "";
                            console.log(importee);
                        }
                        if (importee === 'svelte') return `${CDN_URL}/svelte/index.mjs`;
        
                        if (importee.startsWith('svelte/')) {
                            return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
                        }
        
                        // Handle relative imports for Svelte components
                        if (components_map.has(importee)) return importee;
        
                        // Handle imports from the CDN
                        if (importer && importer.startsWith(CDN_URL)) {
                            const resolved = new URL(importee, importer).href;
                            return resolved.endsWith('.mjs') ? resolved : `${resolved}/index.mjs`;
                        }
        
                        return null; // Other cases are left to Rollup
                    },
                    async load(this, id: string) {
                        if (components_map.has(id)) {
                            return components_map.get(id)?.source; // Return component source code
                        }
                        return await fetch_package(id); // Fetch from the CDN
                    },
                    async transform(this, code: string, id: string) {
                        if (id.endsWith('.svelte')) {
                            // Compile Svelte to JavaScript
                            const compiled = compile(code, {
                                generate: 'dom'
                            });
                            const final_code = compiled.js.code.replace("import \"svelte/internal/disclose-version\";", "\n");
                            return final_code;
                        }
                        if (id.endsWith('.mdx')) {
                            const mk_compiled = await mdcompile(code, {});
                            const compiled = compile(mk_compiled?.code, {
                                generate: 'dom'
                            });
                            const final_code = compiled.js.code.replace("import \"svelte/internal/disclose-version\";", "\n");
                            return final_code;
                        }
                        return null; // Pass other files unchanged
                    },
                },
            ]
        });
       
        const output: string = ( await bundle.generate({ format: 'esm' })).output[0].code;
        return output
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

        // Validation
        if (!eventId || !name || !fee || !maxMember || !minMember || !isTeam) {
            return fail(400, { message: 'All fields are required.' });
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

        let url = API.updateEvent
        if (formData.get('type') == "new") {
            url = API.addEvent
        }

        const res= POST(url, {
            "eventId": eventId,
            "fee": fee,
            "minMember": minMember,
            "maxMember": maxMember,
            "name": name,
            "isTeam": isTeam == "true",
            "markdown": markdown,
            // "password" : "Petrichor"
            "password" : process.env.pass
        })
        .then(res => res.json())
        .catch (err => {
            return fail(500, { message: 'Failed to fetch response' })
        })
        
        return res
    }

    
}