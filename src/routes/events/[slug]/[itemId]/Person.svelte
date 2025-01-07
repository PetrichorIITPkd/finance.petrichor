<script lang="ts">
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
                await fetch("http://localhost:8000/internal/image/", {
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
                    const imageURL = `data:image/png;base64,${res.image}`;
                    url = `${imageURL}`;
                })
                .catch((err) => {
                    console.log("image fetch error: ", err.toString());
                });
            } else {
                url = `${origin}/uploads/${name.toLowerCase()}.webp`;
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
