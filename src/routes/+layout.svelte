<script lang="ts">
	const links: { href: string; label: string }[] = [
		{
			label: 'Home',
			href: '/',
		},
		{
			label: 'example: Additional Column',
			href: '/examples/additional-column',
		},
		{
			label: 'example: Additional Fetch Options',
			href: '/examples/additional-fetch-options',
		},
		{
			label: 'example: Contact',
			href: '/examples/contacts',
		},
		{
			label: 'example: Events',
			href: '/examples/events',
		},
		{
			label: 'example: Pre-set Limit and Offset',
			href: '/examples/pre-set-offset-limit',
		},
		{
			label: 'example: Pre-set Data',
			href: '/examples/pre-set-data',
		},
		{
			label: 'example: Pre-set Data Promise',
			href: '/examples/pre-set-data-promise',
		},
		// {
		// 	label: 'example: Tailwind',
		// 	href: '/examples/tailwind',
		// },
		{
			label: 'Example: Absent api',
			href: '/examples/error-absent-api',
		},
		{
			label: 'Example: error 422',
			href: '/examples/error-422',
		},
		{
			label: 'Example: Pre Existing Query Params',
			href: '/examples/pre-existing-query',
		},
		{
			label: 'Example: theme selector',
			href: '/examples/theme-selector',
		},
		{
			label: 'Example: Pagination Options',
			href: '/examples/pagination-options',
		},
		{
			label: 'Example: select rows',
			href: '/examples/select',
		},
	];
</script>

<div class="page-wrapper">
	<nav>
		<ul>
			{#each links as link}
				<li><a href={link.href}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
	<main>
		<slot />
	</main>
</div>

<style lang="scss">
	:global(body) {
		margin: 0;
	}
	:global(*) {
		box-sizing: border-box;
	}
	.page-wrapper {
		width: 100%;
		font-family: system-ui;
		display: flex;
		justify-content: space-between;
		main {
			margin-inline: auto;
			max-width: 1100px;
			padding-top: 2rem;
		}
		nav {
			border-right: black 2px solid;
			padding-right: 2rem;
		}
		main,
		nav {
			overflow: auto;
			min-height: 100svh;
		}
	}
</style>
