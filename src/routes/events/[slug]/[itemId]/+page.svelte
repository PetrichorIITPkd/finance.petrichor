<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { javascript } from "@codemirror/lang-javascript";
    import { enhance } from "$app/forms";
    import { getContext, onMount } from "svelte";
    import { goto } from "$app/navigation";

    export let data: any;

    let event = data.event;
    let changed = false;

    let iframe: HTMLIFrameElement;

    let markdown = "";
    let transformed_code: string;

    onMount(() => {
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
                    console.log("here")
                    const contentWindow = iframe.contentWindow?.document.body.lastElementChild;
                    contentWindow.innerHTML = data.data;
                } else {
                    transformed_code = data.data;
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
        <link href="https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Roboto&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap" rel="stylesheet">
            <script type='module'>
                let c;

                function update(source) {
                    
                    const blob = new Blob([source],{ type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    
                    import(url).then(( { default : App }) => {
                        if (c) c.$destroy();

                        document.body.lastElementChild.innerHTML = '';
                        c = new App({ target: document.body.lastElementChild })
                    
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

            h1 {
                font-family: var(--sfont) !important;
                text-shadow: 1px 1px 1px #a5a5a5,
                    1px 1.5px 1px #a5a5a5,
                    1px 2px 1px #a5a5a5,
                    1px 2.5px 1px #a5a5a5,
                    1px 3px 1px #a5a5a5
                    ;
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
    --sfont: 'Fredericka the Great', sans-serif;
  }
            html,body {
                overflow:hidden;
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
                    background-image: url("https://cdn.midjourney.com/cad16784-df60-49f4-952d-a46b0e5b311a/0_0.webp");
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
                }
        </style>
        </head>
        <body>
            <div class="bg"> </div>
            <div class="content"></div>
        </body>  
    </html>
    `;
    let height = 0;
    function update(code: string) {
        iframe.contentWindow?.postMessage(code, "*");
        setTimeout(() => {
            height = iframe.contentWindow?.document.body.lastElementChild.scrollHeight + 40; // for padding
            // console.log(height)
        }, 100);
    }

    $: iframe && transformed_code && update(transformed_code);

    const displayPopUp: Function = getContext("displayPopUp");
    const loading: Function = getContext("loading");

    function handleUpdate(onsubmit: { [x: string]: any; cancel: () => void }) {
        loading(true);
        console.log(markdown)
        onsubmit.formData.set('markdown', markdown) 
        onsubmit.formData.set('eventId', event.eventId) 
        console.log(onsubmit.formData.get('markdown'))
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
                        result.data.err
                            ? result.data.err
                            : "Unknown Error. Please contact the administration",
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
        <form method="post" action="?/update" use:enhance={handleUpdate}>
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
                <p>MaxMember</p>
                <input name="maxMember" type="number" value={event.maxMember} />
            </span>
            <span>
                <p>minMember</p>
                <input name="minMember" type="number" value={event.minMember} />
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
        overflow: hidden;
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
