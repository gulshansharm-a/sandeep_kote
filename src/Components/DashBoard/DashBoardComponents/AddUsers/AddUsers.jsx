import AddUsersForm from "./AddUsersForm"

export default function AddUsers() {
    return (
        <div className="h-full w-full flex lg:flex-row flex-col">

            <div className="lg:w-[50%] w-full p-10">
                <AddUsersForm />
            </div>

            <div className="h-screen w-full lg:w-[50%]">
                <iframe className="opacity-50 md:h-[80%] h-[40%] w-full" src="https://lottie.host/?file=bb538d96-bfe2-4d23-8d21-6c81eb29673b/xMsiF3QWJn.json"></iframe>
            </div>
        </div>
    )
}