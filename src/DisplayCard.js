import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { XCircle } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const DisplayCard = ({ monitorNum, deleteMonitor }) => {
	const [diagonal, setDiagonal] = useState();
	const [length, setLength] = useState();
	const [width, setWidth] = useState();
	const [aspectRatio, setAspectRatio] = useState();

	var ratio1 = 16;
	var ratio2 = 9;

	const handleDelete = (value) => {
		deleteMonitor(value);
	};

	const handleCalculate = () => {
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
		}

		var side1 = Math.sqrt(
			Math.pow(diagonal, 2) / (1 + Math.pow(ratio2 / ratio1, 2))
		);
		var side2 = (ratio2 * side1) / ratio1;
		setLength(Math.round(side1 * 100) / 100);
		setWidth(Math.round(side2 * 100) / 100);
	};

	return (
		<div className='m-2 card bg-dark rounded-4'>
			<div className='some'>
				<div className='my-2'>
					<span className='text-light fs-2 ps-3'>
						Monitor {diagonal} {diagonal && 'inch'}
					</span>
					<span
						className='text-light float-end m-1 pe-2'
						onClick={() => handleDelete(monitorNum)}
					>
						<XCircle color='white' size={20} />
					</span>
				</div>

				<InputGroup variant='bg-dark' className='px-3'>
					<InputGroup.Text>Diagonal</InputGroup.Text>
					<Form.Control
						value={diagonal}
						onChange={(e) => setDiagonal(e.target.value)}
					/>
				</InputGroup>
				<InputGroup className='p-3'>
					<InputGroup.Text>Length</InputGroup.Text>
					{/* <span className='bg-light pt-2'>{length}</span> */}
					<Form.Control
						value={length}
						// onChange={(e) => setLength(e.target.value)}
					/>
					<InputGroup.Text>Width</InputGroup.Text>
					{/* <span className='bg-light pt-2'>{width}</span> */}
					<Form.Control
						value={width}
						// onChange={(e) => setWidth(e.target.value)}
					/>
				</InputGroup>
				<div className='form-group m-3'>
					<select
						className='form-control custom-select'
						value={aspectRatio}
						onChange={(event) => setAspectRatio(event.target.value)}
					>
						<option value='16:9'>Select Aspect Ratio (16:9 is default)</option>
						<option value='21:9'>21:9</option>
						<option value='32:9'>32:9</option>
						<option value='16:18'>16:18</option>
					</select>
				</div>
				<Button onClick={handleCalculate} className='m-3'>
					Calculate
				</Button>
			</div>
		</div>
	);
};

export default DisplayCard;
