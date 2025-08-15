import { useCallback, useEffect, useMemo, useState } from 'react'
import MazeCanvas from './components/MazeCanvas'
import Controls from './components/Controls'
import VictoryModal from './components/VictoryModal'
import Legend from './components/Legend'
import { randomSeed } from './utils/mazeUtils'
import { useAudio } from './hooks/useAudio'
import './App.css'

export default function App() {
	const urlSeed = useMemo(() => new URLSearchParams(window.location.search).get('seed') || '', [])
	const [seed, setSeed] = useState(urlSeed || randomSeed())
	const [paused, setPaused] = useState(false)
	const [isVictory, setIsVictory] = useState(false)
	const [autoPath, setAutoPath] = useState([])
	const { playMove, playWin } = useAudio()

	useEffect(() => {
		const usp = new URLSearchParams(window.location.search)
		if (seed) usp.set('seed', seed)
		else usp.delete('seed')
		const url = `${window.location.pathname}?${usp.toString()}`
		window.history.replaceState({}, '', url)
	}, [seed])

	const onNewGame = useCallback(() => {
		setIsVictory(false)
		setAutoPath([])
		setSeed((prev) => prev) // trigger MazeCanvas useEffect via seed state or regenerate via changing seed externally
	}, [])

	const onVictory = useCallback(() => setIsVictory(true), [])

	// Global hotkeys for R, P, Space
	useEffect(() => {
		const handler = (e) => {
			if (e.key === 'p' || e.key === 'P') {
				setPaused((p) => !p)
			}
			if (e.key === 'r' || e.key === 'R') {
				e.preventDefault()
				onNewGame()
			}
		}
		document.addEventListener('keydown', handler)
		return () => document.removeEventListener('keydown', handler)
	}, [onNewGame])

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
			<h1>Maze 25×25</h1>
			<Controls
				seed={seed}
				setSeed={(s) => { setSeed(s); setIsVictory(false); setAutoPath([]) }}
				paused={paused}
				setPaused={setPaused}
				onNewGame={() => { setIsVictory(false); setAutoPath([]); setSeed((prev) => prev) }}
				onAuto={() => { /* handled by MazeCanvas via control bridge */ }}
			/>
			<MazeCanvas
				seed={seed}
				onVictory={onVictory}
				paused={paused || isVictory}
				autoPath={autoPath}
				setAutoPath={setAutoPath}
				playMove={playMove}
				playWin={playWin}
			/>
			<Legend />
			<VictoryModal visible={isVictory} onNewGame={() => { setIsVictory(false); setAutoPath([]); setSeed((prev) => prev) }} />
		</div>
	)
}
