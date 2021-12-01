const drawGameScene = gameState => {
	let ctx = gameState.ctx
	ctx.clearRect(0,0,800,600)
	drawPlayer(ctx, gameState.player)
	drawEnemy(ctx, gameState.enemy)
	drawBall(ctx, gameState.ball)
	drawScore(ctx, gameState.playerScore, gameState.enemyScore)
}

const drawPlayer = (ctx, player) => {
	ctx.fillRect(15, player.y, 15, 60)
}

const drawEnemy = (ctx, enemy) => {
	ctx.fillRect(770, enemy.y, 15, 60)
}

const drawBall = (ctx, ball) => {
	ctx.fillRect(ball.location.x, ball.location.y, 5, 5)
}

const drawScore = (ctx, playerScore, enemyScore) => {
	ctx.fillText(`Player: ${playerScore}`, 300, 15)
	ctx.fillText(`Enemy: ${enemyScore}`, 500, 15)
}

export {drawGameScene}