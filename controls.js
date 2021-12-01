const keydown = (player, e) => {
	switch (e.keyCode) {
		case 87:
		case 38:
			player.directions.up = true
			break
		case 83:
		case 40:
			player.directions.down = true
			break
		default:
			break
	}
}

const keyup = (player, e) => {
	switch (e.keyCode) {
		case 87:
		case 38:
			player.directions.up = false
			break
		case 83:
		case 40:
			player.directions.down = false
			break
		default:
			break
	}
}

export {keydown, keyup}