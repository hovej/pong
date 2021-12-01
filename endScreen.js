const endScreen = playerWon => {
	return (
	`<div class='screen'>
		<h1>${playerWon ? 'You Win!' : 'You Lost!'}</h1>
		<button id='continue'>Continue</button>
	</div>`
	)
}

export { endScreen }