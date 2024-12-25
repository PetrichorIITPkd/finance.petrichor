<script lang="ts">
    export let name;
</script>

<div id="{name}"><slot/></div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>