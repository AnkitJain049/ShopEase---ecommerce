import { Link } from "react-router-dom";

function Card({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="w-full max-w-xs rounded-lg"
    >
      <div
        className="bg-white rounded-lg shadow-md dark:bg-gray-800 flex flex-col h-[400px]
                   transform transition duration-300 ease-in-out 
                   hover:scale-105 hover:shadow-xl hover:border hover:border-gray-500"
      >
        {/* Title + Description */}
        <div className="px-4 pt-4 pb-2 flex flex-col flex-grow overflow-hidden">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight line-clamp-2">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex-grow overflow-hidden line-clamp-3">
            {product.description}
          </p>
        </div>

        {/* Image */}
        <div className="h-[150px] w-full px-4 flex items-center justify-center bg-white">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-b-lg">
          <h1 className="text-lg font-bold text-white">₹{product.price}</h1>
        </div>
      </div>
    </Link>
  );
}

export default Card;
