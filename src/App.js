import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import DisplayCard from './DisplayCard';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function App() {
	var monitors = [1, 2, 3, 4];

	return (
		<div>
			<div className='pb-5'>
				<Navbar
					bg='light'
					data-bs-theme='light'
					className='position-fixed w-100 z-1'
				>
					<Container>
						<Navbar.Brand href='#home'>Navbar</Navbar.Brand>
						<Nav className='me-auto'>
							<Nav.Link href='#home'>Home</Nav.Link>
							<Nav.Link href='#features'>Features</Nav.Link>
							<Nav.Link href='#pricing'>Pricing</Nav.Link>
						</Nav>
					</Container>
				</Navbar>
			</div>

			<div className='App text-center d-flex flex-wrap justify-content-center'>
				{monitors.map((monitor) => {
					return (
						<div className=''>
							<DisplayCard monitorNum={monitor} />
						</div>
					);
				})}
				<div></div>
			</div>
		</div>
	);
}

export default App;
