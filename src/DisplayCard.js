import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const DisplayCard = ({ monitorNum }) => {
	const [diagonalLen, setDiagonalLen] = useState();
	const [Length, setLength] = useState();
	const [Width, setWidth] = useState();

	return (
			<div className='m-2 card col-12 bg-dark rounded-4'>
				<span className='text-light fs-2 my-2'>Monitor {monitorNum}</span>
				<DropdownButton title='Aspect Ration' variant='info'>
					<Dropdown.Item>16:9</Dropdown.Item>
					<Dropdown.Item>21:9</Dropdown.Item>
					<Dropdown.Item>32:9</Dropdown.Item>
					<Dropdown.Item>16:18</Dropdown.Item>
				</DropdownButton>
				<InputGroup variant='bg-dark' className='p-3'>
					<InputGroup.Text>Diagonal</InputGroup.Text>
					<Form.Control />
				</InputGroup>
				<InputGroup className='px-3 pb-3'>
					<InputGroup.Text>Length</InputGroup.Text>
					<Form.Control />
					<InputGroup.Text>Width</InputGroup.Text>
					<Form.Control />
				</InputGroup>
			</div>
	);
};

export default DisplayCard;
