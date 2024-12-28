import type { Data, Vtransaction } from "./types"

// export const backend_url = "http://127.0.0.1:8000/"
export const backend_url = 'https://petri-back.vercel.app/'
// export const backend_url = 'https://petrichor-backend.vercel.app/'

export let API = {
    addEvent: `${backend_url}internal/events/add/`,
    updateEvent: `${backend_url}internal/events/update/`,
    allEvents: `${backend_url}internal/events/all/`,
    nextEventid: `${backend_url}internal/event/getNextId/`,
    getEvent: `${backend_url}internal/event/`,
}

export const default_event = {
    eventId: "TP99",
    name: "Name",
    minMember: 1,
    maxMember: 1,
    isTeam: false,
    fee: 0,
    image_url: "https://picsum.photos/1000/1000",
    organizers:[],
    markdown: `
<script>
  import Box from "./Box.svelte";
  import Person from "./Person.svelte"
  import FlexSection from "./FlexSection.svelte"
  import CenterSection from "./CenterSection.svelte"
  import Section from "./Section.svelte";
  import Button from "./Button.svelte";
</script>

<Box>

# Event 1

27-09-2025

Join our solo singing competition, welcoming voices from East and West,
spanning every genre! Elevate your voice, captivate the audience, and
let the world be spellbound by your talent. It's your moment to enchant
and leave everyone breathless, no matter the genre or cultural influence
every style is welcome.

<FlexSection>

<Button url="#rules">Learn More</Button>
<Button url="#register">Register</Button>
  
</FlexSection>

</Box>

<Section name="rules">

### Rules

<ul>
<li>Participants must finish the painting within 60 minutes.</li>
<li>The theme will be announced before the event.</li> 
<li>Participants are supposed to bring the necessary brushes, sponges and mixing trays.</li>
<li>Paints will be provided.</li>
<li>No part of the design may be applied to the models face before the start of the event.</li>
<li>Painting must not extend down the neck or onto the models chest, shoulders or back areas.</li>
<li>Hair may be clipped or pinned back to fully expose the design area.</li>
<li>Participants should respect the time limit and not disrupt other contestants.</li>
<li>Any inappropriate or offensive designs will result in disqualification.</li>
<li>Decision made by the judges are final. Requests to reconsider the final decision would not be entertained.</li>
</ul>

</Section>

<Section name="structure">

### Structure

<ul>
<li>Participants must finish the painting within 60 minutes.</li>
<li>The theme will be announced before the event.</li> 
<li>Participants are supposed to bring the necessary brushes, sponges and mixing trays.</li>
<li>Paints will be provided.</li>
<li>No part of the design may be applied to the models face before the start of the event.</li>
<li>Painting must not extend down the neck or onto the models chest, shoulders or back areas.</li>
<li>Hair may be clipped or pinned back to fully expose the design area.</li>
<li>Participants should respect the time limit and not disrupt other contestants.</li>
<li>Any inappropriate or offensive designs will result in disqualification.</li>
<li>Decision made by the judges are final. Requests to reconsider the final decision would not be entertained.</li>
</ul>

</Section>

<CenterSection>

# Organizer

<FlexSection>

<Person />
<Person />

</FlexSection>

</CenterSection>
`
}

export const events = {
    "Workshop" : "W",
    "Technical" : "T",
    "Cultural" : "C",
    "Informal" : "I"
}

export async function POST(url: string, body: any) {
    return await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}

export async function reloadData(){
    const res = await POST(`${backend_url}internal/sheets/view/`,{})
    const result = await res.json()
    const verified:Vtransaction[] = [];
    const unverified:Vtransaction[] = [];
    if (result.status == 200){
        const data :Data= result.data
        Object.entries(data).forEach(([eventId,transactions])=>{
            transactions.forEach((e)=>{
                if (e.payment.verified){
                    verified.push({
                        "event":eventId,...e.payment})
                }else {
                    unverified.push({
                        "event":eventId,...e.payment})
                }
            })
        })
    }
    // console.log(result.data)
    return {data: result.data,"verified":verified,"unverified":unverified}
}


export const pre_components = [
    {
        id: 1,
        name : 'Section',
        type: "svelte",
        source: `<script lang="ts">
    export let name;

</script>
<div id={name}>

    <slot/>
</div>

<style>
    div {
    width: 90%;
        border-radius: 10px;
        margin: 10px;
        padding: 10px;
        font-size: 22px;
    }
    @media (max-width: 600px) {
        div {
        font-size: 17px;
        padding: 0px;
        margin: 0px;
        }
    }
</style>`
    },
    {
        id: 1,
        name : 'Box',
        type: "svelte",
        source: `<div><slot/></div>

<style>
	div {
		display: flex;
		flex-direction: column;
		width: 85%;
		place-items: center;
		background-color: rgba(0, 0, 0, 0.146);
		/*
		* Created with https://www.css-gradient.com
		* Gradient link: https://www.css-gradient.com/?c1=ab84d1&c2=1422c1&gt=l&gd=dtl
		*/
		/* background: #ab84d14b; */
		/* background: linear-gradient(135deg, #ab84d134, #1422c139); */
		backdrop-filter: blur(100px);
		background-size: 150% 150%;
		padding: 1rem;
		border-radius: 12px;
		margin-top: 1em;
		/* animation: banneranim 5s linear infinite; */
	}
</style>`
    },
    {
        id: 1,
        name : 'Person',
        type: "svelte",
        source: `<script lang="ts">
    export let name = "John Doe";
    export let phone = "123-456-7890";
    import { onMount } from "svelte";

    let url = "https://www.svgrepo.com/download/454078/account.svg";
    let origin = "https://finance-petrichor.vercel.app";

    onMount(async () => {
        if (window.top.location.origin) origin = window.top.location.origin;

        // img_div = document.getElementById("back_bg") as HTMLDivElement;
        if (phone != "123-456-7890") {
            console.log("Origin:", origin);
            
            if (
                origin == "https://finance-petrichor.vercel.app" ||
                origin == "http://localhost:5173"
            ) {
                console.log("Fetching image", origin);
                await fetch("https://petri-back.vercel.app/internal/image/", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    credentials: "include",
                    mode: "cors",
                    body: JSON.stringify({
                        name: name
                    }),
                })
                .then((res) => res.json())
                .then((res) => {
                    console.log("Got Image");
                    const imageURL = \`data:image/png;base64,\${res.image}\`;
                    url = \`\${imageURL}\`;
                })
                .catch((err) => {
                    console.log("image fetch error: ", err.toString());
                });
            } else {
                url = \`\${origin}/uploads/\${name.toLowerCase()}.png\`;
            }
        } else {
            url = "https://picsum.photos/200/300" 
        }
    });
</script>

<div class="main">
    <div
        class="backpic"
        id="back_bg"
        style="background-image: url('{url}');"
    ></div>
    <h2>{name}</h2>
    <p>{phone}</p>
</div>

<style>
    .main {
        background-color: rgb(27, 27, 27, 0.5);
        backdrop-filter: blur(12px);
        font-family: var(--pfont);
        width: min-content;
        margin: 1em;
        border-radius: 1em;
        overflow: hidden;
        width: 14em;
    }
    .backpic {
        background-size: cover;
        background-position: center;
        position: relative;
        height: 12em;
        width: 12em;
        border-radius: 0.4em;
        margin: 1rem;
        background-repeat: no-repeat;
    }
    h2 {
        font-family: var(--pfont);
        margin-left: 1rem;
        width: max-content;
        /* color: black; */
    }
    p {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.05em;
        margin: 1rem;
        margin-top: -0.5rem;
        overflow: hidden;
        width: fit-content;
        text-align: center;
        border-radius: 0 0 0.4em 0.4em;
    }
</style>
`
    },
    {
        id: 1,
        name : 'FlexSection',
        type: "svelte",
        source: `<div><slot /></div>

<style>
    div{
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
    div h1{
        diplay: inline;
    }
</style>`
    },
    {
        id: 1,
        name : 'CenterSection',
        type: "svelte",
        source: `<script lang="ts">
    export let name;
</script>

<div id="{name}"><slot/></div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>`
    }
    ,{
        id: 1,
        name : 'Button',
        type: "svelte",
        source: `<script lang="ts">
    export let url = "#rules";
    import { onMount } from "svelte";
    let origin = ""
    onMount(() => {
        origin = window.top?.location.url    
    })

	function handleClick() {
		if (url.startsWith("#")) {
			const rulesElement = document.getElementById(url.replace('#', ""));
			if (rulesElement) {
				rulesElement.scrollIntoView({ behavior: 'smooth' });
				rulesElement.focus(); // Optionally focus the element
			}
		} else if (url == "register") {
            window.top.location.href = \`\${origin}/#register\`
        }else {
			window.top.location.href = url;
		}
	}
</script>

<div class="buttons">
    <button class="a-unset register" on:click={handleClick}><slot/></button>
</div>

<style>
    .buttons {
		margin-top: 2rem;
		margin-bottom: 2rem;
	}
	.buttons > a {
		margin-left: 0.75em;
		margin-right: 0.75em;
	}
	button {
		border: none;
		background-color: transparent;
	}
    .a-unset {
        text-decoration: none;
        color: white;
    }
    .register {
		padding: 0.8em;
		padding-inline: 1em;
		background-color: rgba(237, 237, 237, 0.137);
		border-radius: 0.4em;
        margin: 0 10px;
		border: unset;
		color: white;
		font-size: 20px;
		transition: 200ms ease-in-out;
	}
	.register:hover {
		background-color: rgb(255, 255, 255);
		color: black;
	}

	@media (max-width: 600px){
		.register {
			display: block;
			margin-bottom: 1em;
			text-align: center;
		}
	}
</style>

`
    }
]
