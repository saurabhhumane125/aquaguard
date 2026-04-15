export const DropdownMenu = ({ children }: any) => <div>{children}</div>
export const DropdownMenuTrigger = ({ children, ...props }: any) => <button {...props}>{children}</button>
export const DropdownMenuContent = ({ children, ...props }: any) => <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" {...props}>{children}</div>
export const DropdownMenuItem = ({ children, ...props }: any) => <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" {...props}>{children}</div>
export const DropdownMenuLabel = ({ children, ...props }: any) => <div className="block px-4 py-2 text-sm text-gray-900 font-bold" {...props}>{children}</div>
export const DropdownMenuSeparator = () => <div className="border-t border-gray-100 my-1"></div>
