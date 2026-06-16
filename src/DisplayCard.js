import { XCircle, Display, ArrowsAngleExpand } from 'react-bootstrap-icons';
import { calculateDimensions } from './Monitors';

const DisplayCard = ({ monitor, cmPerInch, onUpdate, onDelete }) => {
	const { id, diagonal, aspectRatio, orientation = 'landscape' } = monitor;

	const { length, width } = calculateDimensions(diagonal, aspectRatio);
	const displayW = orientation === 'portrait' ? width : length;
	const displayH = orientation === 'portrait' ? length : width;

	// Area in sq-inches
	const areaSqIn = displayW && displayH ? (displayW * displayH).toFixed(1) : '—';
	// PPI (pixels per inch) — rough estimate for common resolutions
	const commonRes = { '16:9': [1920, 1080], '21:9': [3440, 1440], '32:9': [5120, 1440], '16:18': [2560, 2880] };
	const [rW, rH] = commonRes[aspectRatio] || [1920, 1080];
	const diagPx = diagonal ? Math.sqrt(rW * rW + rH * rH) : null;
	const ppi = diagonal && parseFloat(diagonal) > 0 ? Math.round(diagPx / parseFloat(diagonal)) : '—';

	const handleFieldChange = (field, value) => {
		onUpdate(id, { ...monitor, [field]: value });
	};

	return (
		<div className='card' style={{ borderRadius: '20px' }}>
			{/* Header */}
			<div className='display-card-header'>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					<div style={{
						width: 36, height: 36, borderRadius: '10px',
						background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))',
						border: '1px solid rgba(96,165,250,0.2)',
						display: 'flex', alignItems: 'center', justifyContent: 'center'
					}}>
						<Display size={17} color='#60a5fa' />
					</div>
					<div>
						<div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 }}>
							{diagonal ? `${diagonal}"` : '—'} Monitor
						</div>
						<div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500, marginTop: 2 }}>
							{aspectRatio} · {orientation}
						</div>
					</div>
				</div>
				<button
					onClick={() => onDelete(id)}
					style={{
						background: 'rgba(239,68,68,0.08)',
						border: '1px solid rgba(239,68,68,0.15)',
						borderRadius: '8px',
						padding: '6px',
						cursor: 'pointer',
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						transition: 'all 0.2s',
						color: '#ef4444',
					}}
					onMouseOver={e => {
						e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
						e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
					}}
					onMouseOut={e => {
						e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
						e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
					}}
				>
					<XCircle size={16} />
				</button>
			</div>

			{/* Body */}
			<div className='display-card-body'>

				{/* Diagonal input */}
				<div className='diagonal-input-wrap'>
					<span className='diagonal-input-label'>Diagonal</span>
					<input
						type='number'
						className='diagonal-input-field'
						placeholder='e.g. 32'
						value={diagonal}
						onChange={(e) => handleFieldChange('diagonal', e.target.value)}
					/>
					<span className='diagonal-input-suffix'>inch</span>
				</div>

				{/* Aspect ratio */}
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
					<select
						className='aspect-select'
						value={aspectRatio}
						onChange={(e) => handleFieldChange('aspectRatio', e.target.value)}
					>
						<option value='16:9'>16:9 — Standard</option>
						<option value='21:9'>21:9 — Ultrawide</option>
						<option value='32:9'>32:9 — Super Wide</option>
						<option value='16:18'>16:18 — DualUp</option>
					</select>

					<select
						className='aspect-select'
						value={monitor.wallpaper || 1}
						onChange={(e) => handleFieldChange('wallpaper', parseInt(e.target.value))}
					>
						<option value={1}>Neon Waves</option>
						<option value={2}>Cyber Grid</option>
						<option value={3}>Fluid Gradient</option>
						<option value={4}>Deep Space</option>
						<option value={5}>Minimal Dark</option>
					</select>
				</div>

				{/* Stat grid */}
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
					<div className='display-card-stat'>
						<span className='display-card-stat-label'>Width</span>
						<span className='display-card-stat-value'>{displayW ? `${displayW}"` : '—'}</span>
					</div>
					<div className='display-card-stat'>
						<span className='display-card-stat-label'>Height</span>
						<span className='display-card-stat-value'>{displayH ? `${displayH}"` : '—'}</span>
					</div>
					{/* <div className='display-card-stat'>
						<span className='display-card-stat-label'>Area</span>
						<span className='display-card-stat-value'>{areaSqIn} in²</span>
					</div>
					<div className='display-card-stat'>
						<span className='display-card-stat-label'>PPI ~</span>
						<span className='display-card-stat-value'>{ppi}</span>
					</div> */}
				</div>

				{/* Orientation toggle */}
				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<button
						type='button'
						className={`orientation-btn${orientation === 'landscape' ? ' active' : ''}`}
						onClick={() => handleFieldChange('orientation', 'landscape')}
					>
						🌅 Landscape
					</button>
					<button
						type='button'
						className={`orientation-btn${orientation === 'portrait' ? ' active' : ''}`}
						onClick={() => handleFieldChange('orientation', 'portrait')}
					>
						📱 Portrait
					</button>
				</div>
			</div>
		</div>
	);
};

export default DisplayCard;
