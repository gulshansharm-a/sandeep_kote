
export default function DashBoardUI() {
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">

        <div className="bg-white text-white shadow w-full p-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="hidden md:flex items-center">
              <img src="https://www.emprenderconactitud.com/img/POC%20WCS%20(1).png" alt="Logo" className="w-28 h-18 mr-2" />
              <h2 className="font-bold text-xl">Nombre de la Aplicación</h2>
            </div>
            <div className="md:hidden flex items-center">
              <button id="menuBtn">
                <i className="fas fa-bars text-gray-500 text-lg"></i>
              </button>
            </div>
          </div>

          <div className="space-x-5">
            <button>
              <i className="fas fa-bell text-gray-500 text-lg"></i>
            </button>
            <button>
              <i className="fas fa-user text-gray-500 text-lg"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="p-2 bg-white w-60 flex flex-col hidden md:flex" id="sideNav">
            <nav>
              {/* Navigation links go here */}
            </nav>

            <a className="block text-gray-500 py-2.5 px-4 my-2 rounded transition duration-200 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-cyan-300 hover:text-white mt-auto" href="#">
              <i className="fas fa-sign-out-alt mr-2"></i>Cerrar sesión
            </a>

            <div className="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mt-2"></div>
            <p className="mb-1 px-5 py-3 text-left text-xs text-cyan-500">Copyright WCSLAT@2023</p>
          </div>

          <div className="flex-1 p-4">
            {/* Content goes here */}
          </div>
        </div>
      </div>
    </>
  );
}
