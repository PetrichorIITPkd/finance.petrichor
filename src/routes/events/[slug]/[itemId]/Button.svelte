<script lang="ts">
    export let url = "#rules";
	function handleClick() {
		if (url.startsWith("#")) {
			const rulesElement = document.getElementById(url.replace('#', ""));
			if (rulesElement) {
				rulesElement.scrollIntoView({ behavior: 'smooth' });
				rulesElement.focus(); // Optionally focus the element
			}
		} else {
			window.top.location.href = url;
		}
	}
</script>

<div class="buttons">
    <button class="a-unset register"><slot/></button>
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
		border: unset;
		color: white;
		font-size: 20px;
		transition: 200ms ease-in-out;
	}
	.register:hover {
		background-color: rgb(255, 255, 255);
		color: black;
	}

	@media {
		.register {
			display: block;
			margin-bottom: 1em;
			text-align: center;
		}
	}
</style>

