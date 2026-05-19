export default function Navbar() {
    return (
        <div className='p-4'>
            <nav>
                <ul className='space-y-2'>
                    <li><a href='/' className='block p-2 hover:bg-gray-100'>Home</a></li>
                    <li><a href='#' className='block p-2 hover:bg-gray-100'>About</a></li>
                    <li><a href='#' className='block p-2 hover:bg-gray-100'>Contact</a></li>
                </ul>
            </nav>
        </div>
    )
}
