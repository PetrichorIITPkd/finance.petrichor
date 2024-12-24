<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { javascript } from "@codemirror/lang-javascript";
    import { enhance } from "$app/forms";
    import { getContext, onMount } from "svelte";
    import { goto } from "$app/navigation";

    export let data: any;

    let event = data.event
    let changed = false;

    let iframe:HTMLIFrameElement
    
    let markdown = "";
    let transformed_code: string;

    onMount(() => {
        if (event) {
            markdown = event.markdown
        }
    })

    function convertToHtml() {
        fetch("?/convert", {
            method: "POST",
            body: markdown,
        }).then(res => res.json())
        .then (res => {
            res = (JSON.parse(res.data)[0])
            transformed_code = res
            changed = false
        });
    }

    setInterval(() => {
        if (changed)
            convertToHtml()
    }, 1000)

    const srcdoc = `
    <!doctype html>
    <html>
        <head>
            <script type='module'>
                let c;

                function update(source) {
                    
                    const blob = new Blob([source],{ type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    
                    import(url).then(( { default : App }) => {
                        if (c) c.$destroy();

                        document.body.innerHTML = '';
                        c = new App({ target: document.body })
                    
                    })

                }


                window.addEventListener('message', event => {
                update(event.data)})
            <\/script>
            <style>
            * {
                box-sizing: border-box;
                font-family: monospace;
            }
            html,body {
                overflow:hidden;
            }
                body {
                    margin: 0;
                }
        </style>
        </head>
        <body></body>  
    </html>
    `
    let height = 0;
    function update(code : string) {
        iframe.contentWindow?.postMessage(code, "*")
        setTimeout(() => {
            height = iframe.contentWindow?.document.body.scrollHeight
            console.log(height)
        }, 100)
    }

    $: iframe && transformed_code && update(transformed_code)


    const displayPopUp:Function = getContext('displayPopUp')
	const loading:Function = getContext('loading')

    function handleUpdate() {
        loading( true)
        return async ({result}) => {
            loading( false);
			// console.log(result)
			if (result.type == "success" && result.data){
				const rdata = result.data
				if (rdata.success){
					displayPopUp(
						"Message",
						"Event Updated successfully",
						3000,
						()=>{goto(`/events/${data.pass}/`)}
					)
				}else{
					displayPopUp(
						"Alert",
						rdata.message ?? "Some Error encountered",
						4000,
						()=>{goto(`/events/${data.pass}/`)}
					)
				}
			}else{
				// console.log(result)
				setTimeout(() => {
					displayPopUp(
						"Alert",
						result.data.err ? result.data.err : "Unknown Error. Please contact the administration",
						2000,
						()=>{}
					)
				}, 100);
			}
        }
    }

</script>


<main>
    <h1 style="margin-left: 10px;">Event {(data.type == "new" ? "Create" :"Update")}</h1>
    <div class="update_Area">
        <!-- Geeteshwar's progress here -->
         <form method="post" action="?/update" use:enhance={handleUpdate}>
            <span>
                <p>EventId</p>
                <input name="eventId" type="text" value={event.eventId}/>

            </span>
            <span>
                <p>Name</p>
                <input name="name" type="text" value={event.name}/>
            </span>
            <span>
                <p>fee</p>
                <input name="fee" type="number" value={event.fee}/>
            </span>
            <span>
                <p>MaxMember</p>
                <input name="maxMember" type="number" value={event.maxMember}/>
            </span>
            <span>
                <p>minMember</p>
                <input name="minMember" type="number" value={event.minMember}/>
            </span>
            <input hidden name="markdown" value={markdown} />
            <input hidden name="type" value={data.type} />
            <span>
                <p>isTeam</p>
                <div>
                    <label>
                        <input
                            name="isTeam"
                            type="radio"
                            value="true"
                            checked={event.isTeam === true} />
                        True
                    </label>
                    <label>
                        <input
                            name="isTeam"
                            type="radio"
                            value="false"
                            checked={event.isTeam === false} />
                        False
                    </label>
                </div>
            </span>
            <button type="submit">Update</button>
         </form>
        <!-- <button on:click={convertToHtml}>Convert</button> -->
    </div>
    <div class="readmeArea">
        <div class="textareaElement">
            <CodeMirror bind:value={markdown} lang={javascript()} on:change={() => {changed=true}} />
        </div>
        <iframe class="outputArea" bind:this={iframe} title='repl' {srcdoc} height={height}/>
    </div>
    <p style="margin-left: 10px;">Output Updates every second</p>
</main>



<style>
    main {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
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
        display:  flex;
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
