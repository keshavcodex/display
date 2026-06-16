import DisplayCard from './DisplayCard';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Button } from 'react-bootstrap';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Trash, Eye, EyeSlash } from 'react-bootstrap-icons';


export const DEFAULT_CM_PER_INCH = 0.25;

export const calculateDimensions = (diagonal, aspectRatio) => {
	const diagNum = parseFloat(diagonal);
	if (isNaN(diagNum) || diagNum <= 0) {
		return { length: 0, width: 0 };
	}

	let ratio1 = 16;
	let ratio2 = 9;

	switch (aspectRatio) {
		case '16:9':
			ratio1 = 16;
			ratio2 = 9;
			break;
		case '21:9':
			ratio1 = 21;
			ratio2 = 9;
			break;
		case '32:9':
			ratio1 = 32;
			ratio2 = 9;
			break;
		case '16:18':
			ratio1 = 16;
			ratio2 = 18;
			break;
		default:
			ratio1 = 16;
			ratio2 = 9;
	}

	const side1 = Math.sqrt(
		Math.pow(diagNum, 2) / (1 + Math.pow(ratio2 / ratio1, 2))
	);
	const side2 = (ratio2 * side1) / ratio1;

	return {
		length: Math.round(side1 * 100) / 100,
		width: Math.round(side2 * 100) / 100
	};
};

// px-per-cm conversion (~96 dpi)
const PX_PER_CM = 37.8;

// Snap settings
const SNAP_THRESHOLD = 24; // px distance to trigger monitor-to-monitor snap
const BEZEL_GAP = 6;       // px gap between snapped screens
const DESK_H = 10;         // height of the desk bar in px
const STAND_H = 30;        // neck (24px) + base (6px)
const LABEL_H = 36;        // label above the screen (approx)
const DESK_SNAP = 40;      // px from desk surface to trigger snap-to-desk

// Compute screen pixel dimensions for a monitor config
const getScreenPx = (m, cmPerInch) => {
	const { length, width } = calculateDimensions(m.diagonal, m.aspectRatio);
	const displayW = m.orientation === 'portrait' ? width : length;
	const displayH = m.orientation === 'portrait' ? length : width;
	return {
		w: displayW * cmPerInch * PX_PER_CM,
		h: displayH * cmPerInch * PX_PER_CM,
	};
};

// Apply magnetic snapping — returns { x, y } possibly snapped
const applySnap = (dragId, rawX, rawY, positions, monitors, cmPerInch, canvasH) => {
	const drag = monitors.find(m => m.id === dragId);
	if (!drag) return { x: rawX, y: rawY, nearDesk: false };

	const { w: dw, h: dh } = getScreenPx(drag, cmPerInch);
	let x = rawX;
	let y = rawY;

	for (const other of monitors) {
		if (other.id === dragId) continue;
		const otherPos = positions[other.id];
		if (!otherPos) continue;
		const { w: ow, h: oh } = getScreenPx(other, cmPerInch);

		const oLeft = otherPos.x;
		const oRight = otherPos.x + ow;
		const oTop = otherPos.y + LABEL_H;
		const oBottom = otherPos.y + LABEL_H + oh;

		const dRight = x + dw;
		const dBottom = y + LABEL_H + dh;
		const dTop = y + LABEL_H;

		// ── Horizontal snapping ──────────────────────────────
		if (Math.abs(dRight - oLeft) < SNAP_THRESHOLD) {
			x = oLeft - dw - BEZEL_GAP;
		} else if (Math.abs(x - oRight) < SNAP_THRESHOLD) {
			x = oRight + BEZEL_GAP;
		}

		// ── Vertical snapping (screen edges) ─────────────────
		if (Math.abs(dBottom - oTop) < SNAP_THRESHOLD) {
			y = oTop - dh - LABEL_H - BEZEL_GAP;
		} else if (Math.abs(dTop - oBottom) < SNAP_THRESHOLD) {
			y = oBottom + BEZEL_GAP - LABEL_H;
		}
	}

	// ── Snap to desk surface ──────────────────────────────────
	// wrapper layout (top→bottom): LABEL_H + screenH + STAND_H
	// stand base bottom = y + LABEL_H + dh + STAND_H
	const deskTop = canvasH - DESK_H;
	const standBaseBottom = y + LABEL_H + dh + STAND_H;
	const distToDeskTop = Math.abs(standBaseBottom - deskTop);
	const nearDesk = distToDeskTop < DESK_SNAP;
	if (nearDesk) {
		y = deskTop - LABEL_H - dh - STAND_H;
	}

	return { x, y, nearDesk };
};

const Monitors = () => {
	const [monitors, setMonitors] = useState([
		{ id: 1, diagonal: '32', aspectRatio: '16:9', orientation: 'landscape', wallpaper: 1 },
		{ id: 2, diagonal: '24', aspectRatio: '16:9', orientation: 'portrait', wallpaper: 2 }
	]);
	const [cmPerInch, setCmPerInch] = useState(DEFAULT_CM_PER_INCH);

	const [positions, setPositions] = useState({});
	const [dragging, setDragging] = useState(null);
	const [draggedId, setDraggedId] = useState(null);
	const [nearDesk, setNearDesk] = useState(false);
	const [showMarks, setShowMarks] = useState(true);

	const canvasRef = useRef(null);

	// Keep always-fresh refs so event listeners never read stale state
	const positionsRef = useRef(positions);
	positionsRef.current = positions;
	const monitorsRef = useRef(monitors);
	monitorsRef.current = monitors;
	const cmPerInchRef = useRef(cmPerInch);
	cmPerInchRef.current = cmPerInch;
	const draggingRef = useRef(dragging);
	draggingRef.current = dragging;
	const nearDeskRef = useRef(nearDesk);
	nearDeskRef.current = nearDesk;

	const handleScaleChange = (e) => {
		const val = parseFloat(e.target.value);
		if (!isNaN(val) && val > 0) setCmPerInch(val);
	};

	const incrementMonitor = () => {
		const nextId = monitors.length > 0 ? Math.max(...monitors.map(m => m.id)) + 1 : 1;
		const newMonitor = { id: nextId, diagonal: '27', aspectRatio: '16:9', orientation: 'landscape', wallpaper: (nextId % 5) || 5 };
		setMonitors(prev => [...prev, newMonitor]);
	};

	const handleUpdate = (id, newConfig) => {
		setMonitors(prev => prev.map((m) => (m.id === id ? newConfig : m)));
	};

	const handleDelete = (id) => {
		setMonitors(prev => prev.filter((m) => m.id !== id));
		setPositions(prev => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	// ── Auto Arrange Logic ──────────────────────────────────────
	const getAutoArrangedPositions = useCallback((mons, scale, canvas) => {
		if (!canvas) return {};
		const canvasW = canvas.clientWidth;
		const canvasH = canvas.clientHeight;

		const sizes = mons.map(m => {
			const { w, h } = getScreenPx(m, scale);
			return { id: m.id, w, h };
		});

		let totalW = 0;
		if (sizes.length > 0) {
			totalW = sizes.reduce((sum, s) => sum + s.w, 0) + (sizes.length - 1) * BEZEL_GAP;
		}

		let startX = (canvasW - totalW) / 2;
		const deskTop = canvasH - DESK_H;

		const newPos = {};
		sizes.forEach(s => {
			newPos[s.id] = {
				x: startX,
				y: deskTop - LABEL_H - s.h - STAND_H
			};
			startX += s.w + BEZEL_GAP;
		});
		return newPos;
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const unpositioned = monitors.filter(m => !positions[m.id]);

		if (unpositioned.length > 0) {
			const timer = setTimeout(() => {
				if (Object.keys(positions).length === 0) {
					// Initial load: center all
					const arranged = getAutoArrangedPositions(monitorsRef.current, cmPerInchRef.current, canvasRef.current);
					setPositions(arranged);
				} else {
					// Adding new monitor: place to the right without moving existing
					setPositions(prev => {
						const next = { ...prev };
						let rightmostX = 0;
						monitorsRef.current.forEach(m => {
							if (next[m.id] && next[m.id].y !== -1000) {
								const { w } = getScreenPx(m, cmPerInchRef.current);
								const rightEdge = next[m.id].x + w;
								if (rightEdge > rightmostX) rightmostX = rightEdge;
							}
						});

						let startX = rightmostX > 0 ? rightmostX + BEZEL_GAP : 60;
						const deskTop = canvas.clientHeight - DESK_H;

						unpositioned.forEach(m => {
							const { w, h } = getScreenPx(m, cmPerInchRef.current);
							next[m.id] = {
								x: startX,
								y: deskTop - LABEL_H - h - STAND_H
							};
							startX += w + BEZEL_GAP;
						});

						return next;
					});
				}
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [monitors, positions, getAutoArrangedPositions]);

	// ── Drag Logic ──────────────────────────────────────────────
	const onMouseDown = useCallback((e, id) => {
		if (e.button !== 0) return;
		e.preventDefault();
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const pos = positionsRef.current[id] || { x: 0, y: 0 };
		const drag = { id, offsetX: e.clientX - rect.left - pos.x, offsetY: e.clientY - rect.top - pos.y };
		setDragging(drag);
		setDraggedId(id);
	}, []);

	const onTouchStart = useCallback((e, id) => {
		const touch = e.touches[0];
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const pos = positionsRef.current[id] || { x: 0, y: 0 };
		const drag = { id, offsetX: touch.clientX - rect.left - pos.x, offsetY: touch.clientY - rect.top - pos.y };
		setDragging(drag);
		setDraggedId(id);
	}, []);

	useEffect(() => {
		const move = (clientX, clientY) => {
			const drag = draggingRef.current;
			if (!drag) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			const rawX = clientX - rect.left - drag.offsetX;
			const rawY = clientY - rect.top - drag.offsetY;

			const { x, y, nearDesk } = applySnap(
				drag.id,
				rawX,
				rawY,
				positionsRef.current,
				monitorsRef.current,
				cmPerInchRef.current,
				canvas.offsetHeight
			);

			if (nearDesk !== nearDeskRef.current) setNearDesk(nearDesk);
			setPositions(prev => ({ ...prev, [drag.id]: { x, y } }));
		};

		const onMouseMove = (e) => move(e.clientX, e.clientY);
		const onTouchMove = (e) => {
			e.preventDefault();
			move(e.touches[0].clientX, e.touches[0].clientY);
		};
		const onUp = () => {
			setDragging(null);
			setDraggedId(null);
			setNearDesk(false);

			// Sit all monitors on the desk line, then center the group horizontally
			const canvas = canvasRef.current;
			if (!canvas) return;
			const canvasW = canvas.offsetWidth;
			const canvasH = canvas.offsetHeight;
			const deskTop = canvasH - DESK_H;
			const curPositions = positionsRef.current;
			const curMonitors = monitorsRef.current;
			const curCmPerInch = cmPerInchRef.current;
			if (curMonitors.length === 0) return;

			// Step 1: compute each monitor's desk-aligned Y and track X extent
			const aligned = {};
			let minX = Infinity, maxX = -Infinity;
			for (const m of curMonitors) {
				const pos = curPositions[m.id];
				if (!pos) continue;
				const { w, h } = getScreenPx(m, curCmPerInch);
				aligned[m.id] = { x: pos.x, y: pos.y, w };
				minX = Math.min(minX, pos.x);
				maxX = Math.max(maxX, pos.x + w);
			}

			// Step 2: center the group horizontally
			const groupW = maxX - minX;
			const targetX = (canvasW - groupW) / 2;
			const dx = targetX - minX;

			setPositions(prev => {
				const next = {};
				for (const [id, a] of Object.entries(aligned)) {
					next[id] = { x: a.x + dx, y: a.y };
				}
				return next;
			});
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onUp);
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onUp);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onUp);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onUp);
		};
	}, []); // runs once — uses refs for all live values

	// ── Dynamic Canvas Height ───────────────────────────────────
	let maxMonitorHeight = 0;
	monitors.forEach(m => {
		const h = getScreenPx(m, cmPerInch).h + LABEL_H + BEZEL_GAP + STAND_H;
		if (h > maxMonitorHeight) maxMonitorHeight = h;
	});
	// Size the canvas to comfortably fit the tallest monitor stacked twice, avoiding excessive height.
	const targetCanvasHeight = Math.max(450, maxMonitorHeight * 1.2 + 50);

	const [prevCanvasHeight, setPrevCanvasHeight] = useState(targetCanvasHeight);
	if (targetCanvasHeight !== prevCanvasHeight) {
		const diff = targetCanvasHeight - prevCanvasHeight;
		const newPos = {};
		for (const id in positions) {
			newPos[id] = { ...positions[id], y: positions[id].y + diff };
		}
		setPositions(newPos);
		setPrevCanvasHeight(targetCanvasHeight);
	}

	return (
		<div>
			<Navbar fixed='top' className='glass-navbar py-3'>
				<Container className='d-flex justify-content-between align-items-center'>
					<div className='d-flex align-items-center gap-3'>
						<Navbar.Brand className='navbar-brand-gradient fs-3 m-0'>
							Display Compare
						</Navbar.Brand>
						<span className='d-none d-md-flex align-items-center gap-2 border-start border-secondary ps-3' style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
							Visual Scale Preview (1" =
							<input
								type='number'
								min='0.01'
								step='0.01'
								value={cmPerInch}
								onChange={handleScaleChange}
								style={{
									width: '60px',
									background: 'rgba(255,255,255,0.07)',
									border: '1px solid rgba(148,163,184,0.3)',
									borderRadius: '6px',
									color: '#e2e8f0',
									padding: '2px 6px',
									fontSize: '0.85rem',
									outline: 'none',
									textAlign: 'center',
								}}
							/>
							cm)
						</span>
					</div>
					<div className='d-flex gap-2'>
						<Button onClick={incrementMonitor} className='btn-primary d-flex align-items-center gap-1'>
							<Plus size={20} />
							Add Monitor
						</Button>
						<Button onClick={() => { setMonitors([]); setPositions({}); }} variant='danger' className='d-flex align-items-center gap-1'>
							<Trash size={16} />
							Delete All
						</Button>
					</div>
				</Container>
			</Navbar>

			<Container className='mt-4'>
				{/* Free-form drag canvas */}
				<div ref={canvasRef} className='drag-canvas' style={{ userSelect: 'none', height: prevCanvasHeight }}>
					<div
						className='d-flex align-items-center gap-2 mt-2'
						style={{
							background: 'rgba(255,255,255,0.04)',
							border: '1px solid rgba(148,163,184,0.15)',
							borderRadius: '999px',
							padding: '6px 10px',
							width: 'fit-content',
							margin: '0 auto 1rem'
						}}
					>
						<span
							style={{
								fontSize: '0.8rem',
								color: '#e2e8f0',
								fontWeight: 500,
								whiteSpace: 'nowrap'
							}}
						>
							Monitor markings
						</span>

						<button
							type="button"
							onClick={() => setShowMarks(prev => !prev)}
							title={showMarks ? 'Hide monitor markings' : 'Show monitor markings'}
							style={{
								border: 'none',
								background: showMarks
									? 'rgba(96,165,250,0.15)'
									: 'rgba(255,255,255,0.05)',
								borderRadius: '999px',
								width: '34px',
								height: '34px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: showMarks ? '#60a5fa' : '#94a3b8',
								cursor: 'pointer',
								transition: 'all 0.2s ease'
							}}
						>
							{showMarks ? <Eye size={16} /> : <EyeSlash size={16} />}
						</button>
					</div>
					<div className={`drag-canvas-desk ${nearDesk ? 'desk-active' : ''}`} />

					{monitors.map((m) => {

						const pos = positions[m.id] || { x: 10, y: -1000 };
						const isBeingDragged = draggedId === m.id;
						const { w: screenWpx, h: screenHpx } = getScreenPx(m, cmPerInch);

						// Calculate if stacked
						const myBottom = pos.y + LABEL_H + screenHpx;
						let isStacked = false;
						for (const other of monitors) {
							if (other.id === m.id) continue;
							const oPos = positions[other.id];
							if (!oPos) continue;
							const oTop = oPos.y + LABEL_H;
							const { w: oWpx } = getScreenPx(other, cmPerInch);

							if (
								Math.abs(oTop - BEZEL_GAP - myBottom) < 2 &&
								pos.x < oPos.x + oWpx && pos.x + screenWpx > oPos.x
							) {
								isStacked = true;
								break;
							}
						}

						return (
							<div
								key={m.id}
								className={`draggable-monitor-wrapper${isBeingDragged ? ' is-dragging' : ''}`}
								style={{
									position: 'absolute',
									left: pos.x,
									top: pos.y,
									cursor: isBeingDragged ? 'grabbing' : 'grab',
									transition: isBeingDragged
										? 'none'
										: 'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
								}}
								onMouseDown={(e) => onMouseDown(e, m.id)}
								onTouchStart={(e) => onTouchStart(e, m.id)}
							>
								{/* Screen */}

								<div className='monitor-name-label'>
									{m.diagonal}" Monitor
								</div>
								<div
									className='monitor-screen visualizer-screen'
									style={{
										width: screenWpx,
										height: screenHpx,
										transition: isBeingDragged ? 'none' : 'width 0.3s, height 0.3s, transform 0.4s ease',
										transform: isStacked ? 'rotate(180deg)' : 'none',
										transformOrigin: 'center center'
									}}
								>
									<div style={{
										position: 'absolute', inset: 0,
										backgroundImage: `url(/wallpapers/wp${m.wallpaper || 1}.png)`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										transform: isStacked ? 'rotate(180deg)' : 'none',
										transition: 'transform 0.4s ease'
									}}>
										{showMarks && (
											<>
												<svg className='screen-diagonal-svg'>
													<line
														x1='0'
														y1='100%'
														x2='100%'
														y2='0'
														stroke='rgba(96, 165, 250, 0.4)'
														strokeWidth='1'
														strokeDasharray='3 3'
													/>
												</svg>

												<div
													className='monitor-label-diagonal'
													style={{
														fontSize: '1.5rem',
														fontWeight: 300,
														padding: '2px 5px',
														color: 'white'
													}}
												>
													{m.diagonal}"
												</div>
											</>
										)}
									</div>
								</div>

								{/* Stand */}
								{!isStacked && (
									<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
										<div className='monitor-stand-neck' />
										<div className='monitor-stand-base' />
									</div>
								)}
							</div>
						);
					})}
				</div>


			</Container>

			<Container className='py-2'>
				<div className='d-flex flex-wrap justify-content-center gap-4'>
					{monitors.map((monitor) => (
						<DisplayCard
							key={monitor.id}
							monitor={monitor}
							cmPerInch={cmPerInch}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))}
				</div>
			</Container>
		</div>
	);
};

export default Monitors;
