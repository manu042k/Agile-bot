const NotFoundComponent = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 py-12 px-6">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="px-6 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition duration-300"
        >
          Go Back Home
        </a>
      </div>

      {/* Illustration from shacdn */}
      <div className="max-w-md w-full mx-auto">
        <img
          src="https://cdn.jsdelivr.net/gh/shacdn/shacdn/404.svg"
          alt="Page Not Found"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default NotFoundComponent;
