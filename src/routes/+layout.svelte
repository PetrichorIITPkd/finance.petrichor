<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import PopUpBox from '$lib/components/PopUpBox.svelte';
	import { PopUp } from '$lib/PopUp';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
    import { setContext } from 'svelte';

	let path: string;
	export let data;
	let windowX:number
	let loading = false;
	let PopUpObj = new PopUp('', '', false, null);

	function updateLoading(val: boolean) {
		loading = val;
	}

	/**
	 * display a popUp Box
	 * @param title
	 * @param message
	 * @param timeOutTime
	 */
	const displayPopUp = (
		title: string,
		message: string,
		timeOutTime: number,
		callback: CallableFunction
	) => {
		// console.log("cal" + callback)
		// temporary condition until other modes are made
		PopUpObj.title = title;
		PopUpObj.message = message;
		PopUpObj.afterEnd = callback;
		PopUpObj.totalTime = timeOutTime;
		PopUpObj.isOn = true;
		return;
	};
	setContext('displayPopUp', displayPopUp);
	setContext('loading', updateLoading);
	$: path = $page.url.pathname;
</script>

<Loading spinning={loading}/>

{#if PopUpObj.isOn}
	<PopUpBox bind:PopUpObj/>
{/if}


 <!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
class="main"
in:fade={{duration: 400, delay: 400 }}
out:fly={{ x: windowX, duration: 400 }}
>
		<slot />
</div>
