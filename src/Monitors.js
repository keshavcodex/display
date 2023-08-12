import React from 'react';
import DisplayCard from './DisplayCard';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Button } from 'react-bootstrap';
import { useState } from 'react';

const Monitors = () => {
	const [monitors, setMonitors] = useState([1, 2]);

	const incrementMonitor = () => {
		const newScreen = monitors[monitors.length - 1] + 1;
		setMonitors([...monitors, newScreen]);
	};
	const handleDelete = (value) => {
		var deleteMonitor = monitors;
		deleteMonitor[value - 1] = 0;
		setMonitors([...deleteMonitor]);
	};

	return (
		<div>
			<div className='pb-5'>
				<Navbar
					bg='light'
					data-bs-theme='light'
					className='position-fixed w-100 z-1'
				>
					<Container>
						<h3>You can add or remove Monitors to compare all</h3>
						<Button onClick={incrementMonitor}>Add Monitor</Button>
						<Button onClick={() => setMonitors([1])} variant='danger'>
							Delete All
						</Button>
					</Container>
				</Navbar>
			</div>

			<div className='text-center py-5'>
				{monitors.map((monitor) => {
					return (
						<div
							className='d-inline-flex
'
						>
							{monitor !== 0 && (
								<DisplayCard
									monitorNum={monitor}
									deleteMonitor={handleDelete}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Monitors;
