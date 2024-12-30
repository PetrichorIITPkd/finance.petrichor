<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { javascript } from "@codemirror/lang-javascript";
    import { enhance } from "$app/forms";
    import { getContext, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import type { Event } from "$lib/types";

    export let data: any;

    let event: Event = data.event;
    let changed = false;

    let iframe: HTMLIFrameElement;

    let markdown = "";
    let transformed_code: string;
    let origin = "https://finance-petrichor.vercel.app"
    onMount(() => {
        
        if (window.location.origin)
            origin = window.location.origin
        if (event) {
            markdown = event.markdown;
            convertToHtml()
        }
    });

    function convertToHtml() {
        fetch("?/convert", {
            method: "POST",
            body: markdown,
        })
            .then((res) => res.json())
            .then((res) => {
                const data = JSON.parse(JSON.parse(res.data)[0]);
                if (data.isError) {
                    const contentWindow = iframe.contentWindow?.document.body.lastElementChild;
                    contentWindow.innerHTML = data.data;
                } else {
                    transformed_code = data.data;
                    update(transformed_code)
                }
                changed = false;
            })
            .catch((e) => {
                transformed_code = `<p>${e}</p>`;
                changed = false;
            });
    }

    setInterval(() => {
        if (changed) convertToHtml();
    }, 1000);

    const srcdoc = `
    <!doctype html>
    <html>
        <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap" rel="stylesheet">
            <script type='module'>
                let c;

                function update(source) {
				
                    const blob = new Blob([source],{ type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
					const content_holder = document.getElementById('content_holder')
					// console.log(source)
                    import(url).then(( { default : App }) => {
                        if (c) c.$destroy();

                        content_holder.innerHTML = '';
                        c = new App({ target: content_holder })
                    
                    })

                }


                window.addEventListener('message', event => {
                update(event.data)})
            <\/script>
            <style>
            * {
                box-sizing: border-box;
                font-family: var(--wfont);
            }
			@font-face {
				font-family: 'Atmospheric';
				src: url('/Fonts/Atmospheric.ttf') format('embedded-opentype'),
				/* Internet Explorer */
				url('/Fonts/Atmospheric.ttf') format('woff2'),
				/* Super Modern Browsers */
				url('/Fonts/Atmospheric.ttf') format('woff'),
				/* Pretty Modern Browsers */
				url('/Fonts/Atmospheric.ttf') format('truetype'),
				/* Safari, Android, iOS */
				url('/Fonts/Atmospheric.ttf') format('svg');
				/* Legacy iOS */
				font-weight: 200;
			}

            h1 {
                font-family: var(--sfont) !important;
                text-shadow: 1px 1px 1px #a5a5a5,
                    1px 1.5px 1px #a5a5a5,
                    1px 2px 1px #a5a5a5,
                    1px 2.5px 1px #a5a5a5,
                    1px 3px 1px #a5a5a5
                    ;
				font-size: 40px;
            }
            ::-webkit-scrollbar {
				width: 1px;
				background: transparent;
				/* make scrollbar transparent */
			}
			:root {
				--pfont: 'Raleway', sans-serif;
				--wfont: 'Roboto', sans-serif;
				--ofont: 'Arial', sans-serif;
				--sfont: 'Atmospheric', sans-serif;
			}
			.bg {
				position: fixed;
				top: 0;
				left: 0;
				height: 100vh;
				width: 100vw;
				filter: blur(5px) brightness(50%);
				background-position: center;
				background-size: cover;
				background-image: url(${currentEvent.image});
			}
			.content {
				z-index: 1;
				padding-top: 5.5em;
				padding-left: 1em;
				position: relative;
				width: 100%;
				display: flex;
				color: white;
				flex-direction: column;
				place-items: center;
				overflow-y: scroll;
			}
			body {
				margin: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
			}
			#register {
				border: none;
				font-size: 20px;
				color: white;
				position: relative;
				text-decoration: none;
				z-index: 10;
			}
			@media (max-width:600px) {
				.content {
				z-index: 1;
				padding-top: 2em;
				margin: 0;
				padding-left: 0;
			}
		}
        </style>
        </head>
        <body>
            <div class="content" id="content_holder"></div>
			<span id="register"></span>
        </body>  
    </html>
    `;

    let height = 0;
    function update(code: string) {
        console.log("Updating")
        iframe.contentWindow?.postMessage(code, "*");
        setTimeout(() => {
            height = iframe.contentWindow?.document.getElementById('content_holder').scrollHeight + 40; // for padding
            // console.log(height)
        }, 100);
    }

    $: iframe && transformed_code && update(transformed_code);

    let organizers = event.organizers

    const displayPopUp: Function = getContext("displayPopUp");
    const loading: Function = getContext("loading");

    function handleUpdate(onsubmit: { [x: string]: any; cancel: () => void }) {
        loading(true);
        onsubmit.formData.set('markdown', markdown) 
        onsubmit.formData.set('eventId', event.eventId) 
        const prev_organizer_map = {}
        event.organizers.forEach((organizer, index) => {
            prev_organizer_map[`organizers${index}`] = organizer
        })
        onsubmit.formData.set('previous_organizers', JSON.stringify(prev_organizer_map)) 

        return async ({ result }) => {
            loading(false);
            // console.log(result)
            if (result.type == "success" && result.data) {
                const rdata = result.data;
                if (rdata.success) {
                    displayPopUp(
                        "Message",
                        "Event Updated successfully",
                        3000,
                        () => {
                            goto(`/events/${data.pass}/`);
                        },
                    );
                } else {
                    displayPopUp(
                        "Alert",
                        rdata.message ?? "Some Error encountered",
                        4000,
                        () => {
                            goto(`/events/${data.pass}/`);
                        },
                    );
                }
            } else {
                // console.log(result)
                setTimeout(() => {
                    displayPopUp(
                        "Alert",
                        result.data.message ?? "Some Error encountered",
                        2000,
                        () => {},
                    );
                }, 100);
            }
        };
    }
</script>

<main>
    <h1 style="margin-left: 10px;">
        Event {data.type == "new" ? "Create" : "Update"}
    </h1>
    <div class="update_Area">
        <!-- Geeteshwar's progress here -->
        <form method="post" action="?/update" enctype="multipart/form-data" use:enhance={handleUpdate}>
            <span>
                <p>EventId</p>
                <input name="eventId" type="text" value={event.eventId} disabled/>
            </span>
            <span>
                <p>Name</p>
                <input name="name" type="text" value={event.name} />
            </span>
            <span>
                <p>fee</p>
                <input name="fee" type="number" value={event.fee} />
            </span>
            <span>
                <p>MinMember</p>
                <input name="minMember" type="number" value={event.minMember} />
            </span>
            <span>
                <p>MaxMember</p>
                <input name="maxMember" type="number" value={event.maxMember} />
            </span>
            <span>
                <p>Background Image</p>
                <input name="image_url" type="text" value={event.image_url} />
            </span>
            <input hidden name="type" value={data.type} />
            <span>
                <p>isTeam</p>
                <div>
                    <label>
                        <input
                            name="isTeam"
                            type="radio"
                            value="true"
                            checked={event.isTeam === true}
                        />
                        True
                    </label>
                    <label>
                        <input
                            name="isTeam"
                            type="radio"
                            value="false"
                            checked={event.isTeam === false}
                        />
                        False
                    </label>
                </div>
            </span>
            <span>
                <button type="button" on:click={() => {organizers.push(0); organizers = organizers}}>Add Organizer</button>
            </span>
            {#each organizers as organizer, index}
            <span style="margin: 30px 0;display:flex; flex-wrap:wrap">
                <span>
                    <label for={`organizers${index}${(organizer == 0) ? "new" : ""}`} >Organizer {index}: </label>
                    <input name={`organizers${index}${(organizer == 0) ? "new" : ""}` } type="file" accept=".png" placeholder="Organizer" />
                </span>
                <span>

                    <label for={`name_organizers${index}${(organizer == 0) ? "new" : ""}`} >Name</label>
                    <input name={`name_organizers${index}${(organizer == 0) ? "new" : ""}`} type="text" value={(organizer == 0) ? "" : organizer} />
                </span>
                <span>

                    <label for={`overwrite_organizers${index}${(organizer == 0) ? "new" : ""}`}>Overwrite if name exists:</label>
                    {#if organizer == 0}
                    <input 
                    name={`overwrite_organizers${index}${(organizer == 0) ? "new" : ""}`} 
                    type="checkbox" 
                    />
                    {:else}
                    <input 
                    name={`overwrite_organizers${index}${(organizer == 0) ? "new" : ""}`} 
                    type="checkbox" 
                    checked
                    />
                    {/if}
                </span>
            </span>

            {/each}
            <span>
                <button type="submit">{(data.type == "new") ? "Create": "Update"}</button>
                <button type="button" on:click={convertToHtml}>Convert</button>
            </span>
        </form>
    </div>
    <div class="readmeArea">
        <div class="textareaElement">
            <CodeMirror
                bind:value={markdown}
                lang={javascript()}
                on:change={() => {
                    changed = true;
                }}
            />
        </div>
        <iframe
            class="outputArea"
            bind:this={iframe}
            title="repl"
            {srcdoc}
            {height}
        />
    </div>
    <p style="margin-left: 10px;">Output Updates every second</p>
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
        overflow-y: scroll;
        overflow-x: hidden;
        position: relative;
        top: 0;
        left: 0;
    }
    .update_Area {
        padding: 10px;
    }
    * {
        box-sizing: border-box;
    }
    .textareaElement {
        overflow-x: hidden;
        overflow-y: auto;
        border: 1px solid #4caf50;
        border-radius: 5px;
        padding: 10px;
        min-height: 150px;
        width: 50%;
        resize: none;
        color: gray;
        background-color: rgb(240, 233, 233);
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    span {
        display: flex;
        gap: 10px;
    }
    .textareaElement:focus {
        color: #33363c;
    }

    .readmeArea {
        width: 100vw;
        display: flex;
        border-top: 1px solid gray;
        align-items: center;
        gap: 10px;
        padding: 10px 10px;
        justify-content: center;
    }
    .outputArea {
        width: 50%;
        border: 1px solid #4c66af;
        border-radius: 5px;
        min-height: 150px;
    }
    @media (max-width: 720px) {
        .readmeArea {
            display: flex;
            flex-direction: column;
        }
        .outputArea {
            width: 100%;
        }
        .textareaElement {
            width: 100%;
        }
    }
</style>
