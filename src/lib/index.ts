import type { Data, Vtransaction } from "./types"

// export const backend_url = "http://127.0.0.1:8000/"
export const backend_url = 'https://petri-back.vercel.app/'
// export const backend_url = 'https://petrichor-backend.vercel.app/'

export let API = {
    addEvent: `${backend_url}/internal/events/add/`,
    updateEvent: `${backend_url}/internal/events/update/`,
    allEvents: `${backend_url}/internal/events/all/`,
    getEvent: `${backend_url}/internal/event/`,
}

export const default_event = {
    eventId: "TP99",
    name: "Name",
    minMember: 1,
    maxMember: 1,
    isTeam: false,
    fee: 0,
    markdown: ""
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
        name : 'Count',
        type: "svelte",
        source: `
<script>
	export let count = 0;
</script>

<span class="outer">
	<button on:click="{() => count = count - 1}">-</button>
	<span class="inner">{count}</span>
	<button on:click="{() => count = count + 1}">+</button>
</span>

<style>
	.outer {
		background: darkorange;
		height: 20px;
		font-size: 12px;
		display: inline-flex;
		justify-content: space-between;
		align-items: center;
		transform: translateY(-1px);
		margin: 0 5px;
		border-radius: 3px;
		width: 65px;
		box-shadow: 0 3px 15px 1px rgba(0,0,0,0.3)
  }

	.inner {
		margin: 0 0px;
  }

	button {
		height: 20px;
		padding: 0px 7px 1px 7px;
		margin: 0;
		border: none;
		background: none;
		color: #eee;
		font-weight: bold;
		cursor: pointer;
	}
</style>
`
    },
    {
        id: 1,
        name : 'Section',
        type: "svelte",
        source: `
<div>

    <slot/>
</div>

<style>
    div {
        width: 90%;
        border-radius: 10px;
        margin: 10px;
        box-shadow: 0 0 10px gray;
        padding: 10px;
        background-color: rgb(174, 166, 166);
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
		background-color: rgb(174, 166, 166);
		padding: 2rem 2rem;
		text-align: center;
        width: 100%;
  }
</style>`
    },
    {
        id: 1,
        name : 'Person',
        type: "svelte",
        source: `<script lang="ts">
    export let personData = {
        name: 'John Doe',
        phone: '123-456-7890',
        image: 'https://images.unsplash.com/photo-1622838320000-4b3b3b3b3b3b'
    }
</script>

<div class="main">
    <div class="bg" style="background-image: url('{personData.image}');">
    </div>
    <h2>{personData.name}</h2>
    <p>{personData.phone}</p>
</div>


<style>
    .main{
        background-color: rgb(27, 27, 27, 0.5);
        backdrop-filter: blur(12px);
        font-family: var(--pfont);
        width: min-content;
        margin: 1em;
        border-radius: 1em;
        overflow: hidden;
        width: 14em;
    }
    div.bg{
        background-size: cover;
        background-position: center;
        position: relative;
        height: 12em;
        aspect-ratio: 1;
        border-radius: 0.4em;
        margin: 1rem;
        background-repeat: no-repeat;
    }
    h2{
        font-family: var(--pfont);
        margin-left: 1rem;
        width: max-content;
        /* color: black; */
    } 
    p{
        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.05em;
        margin: 1rem;
        margin-top: -0.5rem;
        overflow: hidden;
        width: fit-content;
        text-align: center;
        border-radius: 0 0 0.4em 0.4em;
    }

    @media screen and (max-width:600px){
        div.main{
            position: relative;
            left: 20%;
			transform: translate(-50%);
        }
    }
</style>`
    },
    {
        id: 1,
        name : 'Organisers',
        type: "svelte",
        source: `<div><slot /></div>

<style>
    div{
        display: flex;
        justify-content: center;
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
        source: `<div><slot/></div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>`
    }
]
