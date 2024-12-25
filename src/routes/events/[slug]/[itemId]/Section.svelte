<script lang="ts">
    export let name;

</script>
<div id={name}>

    <slot/>
</div>

<style>
    div {
        width: 100%;
        padding: 10px;
        background-color: rgb(174, 166, 166);
    }
</style>