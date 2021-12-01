import {drawGameScene} from './engine.js'
import {keyup, keydown} from './controls.js'
import {startScreen} from './startScreen.js'
import {endScreen} from './endScreen.js'
import {difficultyValues} from './difficultyValues.js'

const canvas = document.getElementById('main')
const ctx = canvas.getContext('2d')

const gameState = {
	ctx,
	player: {
		y: 250,
		directions: {
			up: false,
			down: false
		},
		speed: 5
	},
	enemy: {
		y: 200,
		directions: {
			up: false,
			down: false
		},
		speed: 4,
		movingToPrediction: false,
		predictionY: null,
		reactionTime: 60, // 60 = 1 second
		reactionCounter: 0,
		accuracy: 45
	},
	ball: {
		speed: 5,
		directions: {
			up: false,
			right: true
		},
		location: {
			x: 100,
			y: 300
		}
	},
	playerScore: 0,
	enemyScore: 0,
	scorePauseCounter: 0,
	scorePauseActive: false,
	gameOver: false
}

const initializeGame = difficulty => {
	document.getElementById('overlay').style.display = 'none'
	gameState.gameOver = false
	gameState.playerScore = 0
	gameState.enemyScore = 0
	getBallStart()
	if (gameState.ball.directions.right) {
		enemyDecision()
	}
	setGameState(difficulty)
	window.addEventListener('keyup', e => keyup(gameState.player, e))
	window.addEventListener('keydown', e => keydown(gameState.player, e))
	drawGameScene(gameState)
	updateGameScene()
}

const onScore = playerScored => {
	if (playerScored) {
		gameState.playerScore++
	} else {
		gameState.enemyScore++
	}
	if (gameState.playerScore === 3 || gameState.enemyScore === 3) {
		gameState.gameOver = true
		showEndScreen(gameState.playerScore === 3)
		return
	}
	gameState.scorePauseActive = true
	getBallStart()
	if (gameState.ball.directions.right) {
		enemyDecision()
	}
}

const setGameState = difficulty => {
	gameState.ball.speed = difficultyValues[difficulty].ballSpeed
	gameState.enemy.accuracy = difficultyValues[difficulty].accuracy
	gameState.enemy.reactionTime = difficultyValues[difficulty].reactionTime
	gameState.enemy.speed = difficultyValues[difficulty].enemySpeed
	gameState.player.speed = difficultyValues[difficulty].playerSpeed
}

const getBallStart = () => {
	const startSide = Math.random() > .49 ? 0 : 1
	gameState.ball.location = {
		x: startSide ? 50 + Math.floor(Math.random() * 100) : 650 + Math.floor(Math.random() * 100),
		y: Math.floor(Math.random() * 595)
	}
	gameState.ball.directions = {
		up: Math.random() > .49,
		right: startSide
	}
}

const updateGameScene = () => {
	if (gameState.gameOver) {
		console.log('Game Over')
		return
	}
	if (gameState.scorePauseActive) {
		gameState.scorePauseCounter++
		if (gameState.scorePauseCounter > 150) {
			gameState.scorePauseActive = false
			gameState.scorePauseCounter = 0
		}
	} else {
		updatePlayer()
		updateEnemy()
		updateBall()
		drawGameScene(gameState)
	}
	window.requestAnimationFrame(updateGameScene)
}

const updatePlayer = () => {
	if (gameState.player.directions.up && gameState.player.y >= gameState.player.speed) {
		gameState.player.y -= gameState.player.speed
	} else if (gameState.player.directions.down && gameState.player.y <= 540 - gameState.player.speed) {
		gameState.player.y += gameState.player.speed
	}
}

const updateEnemy = () => {
	if (gameState.ball.directions.right && !gameState.enemy.movingToPrediction) {
		gameState.enemy.reactionCounter++
		if (gameState.enemy.reactionCounter > gameState.enemy.reactionTime) {
			enemyDecision()
			gameState.enemy.reactionCounter = 0
		}
	}

	if (gameState.enemy.movingToPrediction) {
		if (gameState.enemy.predictionY > gameState.enemy.y + 32 && gameState.enemy.y + gameState.enemy.speed < 540) {
			gameState.enemy.y += gameState.enemy.speed
		} else if (gameState.enemy.predictionY < gameState.enemy.y + 28 && gameState.enemy.y > gameState.enemy.speed) {
			gameState.enemy.y -= gameState.enemy.speed
		}
	}
}

const updateBall = () => {
	// check for collision with border
	if (gameState.ball.location.y < gameState.ball.speed && gameState.ball.directions.up) {
		gameState.ball.directions.up = false
	} else if (gameState.ball.location.y > 595 - gameState.ball.speed && !gameState.ball.directions.up) {
		gameState.ball.directions.up = true
	}
	if (gameState.ball.location.x < gameState.ball.speed && !gameState.ball.directions.right) {
		onScore(false)
	} else if (gameState.ball.location.x > 795 - gameState.ball.speed && gameState.ball.directions.right) {
		onScore(true)
	}

	// check for collision with player paddle
	if (gameState.ball.location.x - gameState.ball.speed < 30) {
		const newLocation = gameState.ball.location.y + (gameState.ball.directions.up ? -gameState.ball.speed : gameState.ball.speed)
		if (newLocation + 5 > gameState.player.y && newLocation < gameState.player.y + 60) {
			gameState.ball.directions.right = true
		}
	}

	// check for collision with enemy paddle
	if (gameState.ball.location.x + gameState.ball.speed > 770) {
		const newLocation = gameState.ball.location.y + (gameState.ball.directions.up ? -gameState.ball.speed : gameState.ball.speed)
		if (newLocation + 5 > gameState.enemy.y && newLocation < gameState.enemy.y + 60) {
			gameState.ball.directions.right = false
			gameState.enemy.movingToPrediction = false
			console.log('WAITING FOR NEW CONTACT POINT')
		}
	}

	gameState.ball.directions.up ? gameState.ball.location.y -= gameState.ball.speed : gameState.ball.location.y += gameState.ball.speed
	gameState.ball.directions.right ? gameState.ball.location.x += gameState.ball.speed : gameState.ball.location.x -= gameState.ball.speed
}

const enemyDecision = () => {
	// calculate future ball position
	let pixelsAway = 770 - gameState.ball.location.x + 5
	let finalY = gameState.ball.location.y
	let goingUp = gameState.ball.directions.up
	while (pixelsAway > (goingUp ? finalY : 595 - finalY)) {
		if (goingUp) {
			pixelsAway -= finalY
			finalY = 0
			goingUp = false
		} else {
			pixelsAway -= (595 - finalY)
			finalY = 595
			goingUp = true
		}
	}
	finalY += goingUp ? -pixelsAway : pixelsAway

	// adjust target with accuracy
	let accuracyRating = Math.floor(Math.random() * 2 * gameState.enemy.accuracy) - gameState.enemy.accuracy
	finalY += accuracyRating
	console.log(accuracyRating)

	// update gameState with prediction
	gameState.enemy.predictionY = finalY
	gameState.enemy.movingToPrediction = true
	console.log('MOVING TOWARDS CONTACT POINT')
}

const showEndScreen = playerWon => {
	document.getElementById('overlay').style.display = ''
	document.getElementById('overlay').innerHTML = endScreen(playerWon)
	document.getElementById('continue').addEventListener('click', () => showStartScreen())
}

const showStartScreen = () => {
	document.getElementById('overlay').innerHTML = startScreen()
	document.getElementById('easy').addEventListener('click', () => initializeGame('easy'))
	document.getElementById('medium').addEventListener('click', () => initializeGame('medium'))
	document.getElementById('hard').addEventListener('click', () => initializeGame('hard'))
}

showStartScreen()
