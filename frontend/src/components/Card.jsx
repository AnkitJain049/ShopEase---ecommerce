import { Link } from "react-router-dom";

function Card({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="w-full max-w-xs rounded-lg"
    >
      <div
        className="bg-white rounded-lg shadow-sm dark:bg-gray-800 flex flex-col h-[400px]
                   border border-gray-200 dark:border-gray-700/60
                   transform transition-all duration-300 ease-in-out 
                   hover:scale-[1.03] hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500/80"
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
        <div className="h-[150px] w-full px-4 flex items-center justify-center bg-white rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/40 rounded-b-lg border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</span>
          <h1 className="text-lg font-extrabold text-blue-600 dark:text-blue-400">₹{product.price}</h1>
        </div>
      </div>
    </Link>
  );
}

export default Card;
