<script lang="ts">
    import EventTicket from "$lib/components/eventTicket.svelte";
    import type { Event } from "$lib/types";

    export let data: any;
    let events: Event[] = data.data;
    let markdown= "Start the Markdown here"
    function changeMarkdown(e) {
        markdown = e.target.innerHtml
    }
</script>

<EventTicket events={events} pass={data.pass}/>
