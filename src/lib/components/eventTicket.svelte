<script lang="ts">
    import { goto } from "$app/navigation";

    export let events: Event[]  = [];
    export let pass:string = "";

    function addEvent() {
        goto(`/events/${pass}/new`)
    }
</script>

<style>

    .container {
        box-sizing: border-box;
        width: 100%;
        padding: 10px;
        background-color: #ffffff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .header {
        display: flex;
        justify-content: flex-end; 
        padding: 10px 0;
        border-bottom: 1px solid #ccc;
        margin-bottom: 20px;
    }

    .add-event-btn {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 15px;
        font-size: 14px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .add-event-btn:hover {
        background-color: #0056b3;
    }

    .event-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .event-block {
        background-color: #f4f4f4;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        cursor: pointer;
        text-overflow: ellipsis;
        flex-direction: column;
        overflow: hidden;
        gap: 10px;
    }

    .event-block span {
        font-size: 14px;
        font-weight: bold;
    }

    @media (max-width: 700px) {
        .event-list {
            flex-direction: column;
        }
    }
</style>

<div class="container">
    <div class="header">
        <button class="add-event-btn" on:click={addEvent}>Add Event</button>
    </div>

    <div class="event-list">
        {#each events as event}
            <div class="event-block" on:click={() => goto(`/events/${pass}/${event.eventId}`)}>
                <span>Event ID: {event.eventId}</span>
                <span>Name: {event.name}</span>
            </div>
        {/each}
    </div>
</div>
