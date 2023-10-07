export default function UserCard({ userName, userEmail, balance }) {
    return (
        <>
            {/* <h2>Distributor: {distributorName} - {email}</h2> */}
            <div className="w-full max-w-md p-4 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                <div className="flow-root">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="py-3 sm:py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <img className="w-8 h-8 rounded-full" src="https://cs12.pikabu.ru/post_img/big/2022/10/24/2/1666571824193118478.jpg" alt="User image" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                        {userName}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500 truncate dark:text-gray-400">
                                        {userEmail}
                                    </p>
                                </div>
                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                    {balance}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
