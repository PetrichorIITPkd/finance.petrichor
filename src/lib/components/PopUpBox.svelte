<script lang="ts">
    import { onMount } from "svelte";
    import { PopUp } from "$lib/PopUp";
    // import logo from "$lib/assets/logo.png"
    import logo from "$lib/assets/logo.png"

    let popUpDialog:HTMLDialogElement;
    export let PopUpObj:PopUp;
    let title = PopUpObj.title;
    let content = PopUpObj.message;
    let x:any;
    $:width = 0;

    onMount(()=>{
        popUpDialog.onclose = (e) => {
            clearInterval(x)
            PopUpObj.isOn = false
            if (PopUpObj.afterEnd != null) 
                PopUpObj.afterEnd()
        }

        popUpDialog.showModal()

        width = 0;
        if (PopUpObj.totalTime != 0){
            let initialTime = Date.now() 
            let count = 0;
            x = setInterval(()=> {
                width = (count / PopUpObj.totalTime * 100);
                let newt = Date.now()
                count += newt - initialTime;
                initialTime = newt
                if (count >= PopUpObj.totalTime){
                    popUpDialog.close()
                }
                
            },5);
        }
    })

</script>

<dialog bind:this={popUpDialog}>
    <div class="popUp Box" >
        <div class="popUpTitleBox">
            <div class="progressDiv" style="width: {width}%;"/>
            <!-- <img src={logo} alt="" height="50px" width=" 50px"/> -->
            <img src={logo} alt="" height="70px"/>
            </div>
        <div class="restBox">
            <!-- <p>{title}</p> -->
            <div class="popUpContentBox">
                <p>{content}</p>
            </div>
            <div class="buttonDiv">
                <button on:click={ () => {
                    popUpDialog.close()
                }} >Dismiss</button>
            </div>
        </div>
    </div>
</dialog>

<style>
    button{
        color: white;
        background-color: #7171714a;
        padding: 5px 10px;
        border-radius: 5px;
    }
    p{
        text-align: center;
        margin: 0;
    }
    dialog{
        position: fixed;
        z-index: 400;
        min-width: 100vw;
        min-height: 100vh;
        display: flex;
        align-items: center;
        margin: 0 !important;
        justify-content: center;
        background-color: #6161614a;
        transition: all 0.3s ease;
    }

    .progressDiv {
        width: 0;
        background-color: #7e7e7e;
        transition: all 0.0000001s ease-in;
        height: 5px;
    }
    .popUp {
        color: #ede7f6;
        display: flex;
        flex-direction: column;
        position: absolute;
        align-items: center;
        height: auto;
        overflow-x: scroll;
        overflow-y: scroll;
    }

    .popUpTitleBox {
        width: 100%;
        margin: 0 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        /* background-color: #ef5350; */
        background-color: black;
        flex: 1;
    }

    .restBox {
        flex: 12;
        width: 100%;
        padding-bottom: 20px;
        margin: 0 30px;
        display: flex;
        flex-direction: column;
        background-color: black;
    }

    .popUpContentBox {
        width: 100%;
        text-overflow: ellipsis;
        overflow-y: scroll;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 3;
        margin: 10px 5px;
        /* border-top: solid 1px #212121; */
    }

    .popUpContentBox p {
        margin: 3px;
        text-align: center;
        font-size: 13px;
    }

    .Box{
        max-width: 60%;
        max-height: 80%;
        min-width: 300px;
        min-height: 200px ;
    }

    .buttonDiv{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        /* border-top: solid 1px #212121;    */
        font-size: 11px;
        bottom: 0px;
        cursor: pointer;
        padding: 5px 0;
        height: 30px;
    }
    button{
        cursor: pointer;
        border: none;
    }

    ::-webkit-scrollbar{
        display: none;
    }

    @media (max-width:900px){
        .Box{
            max-width: 80%;
        }
    }
</style>