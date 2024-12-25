<script lang="ts">
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
</style>