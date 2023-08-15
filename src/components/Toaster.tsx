import { Toaster } from "react-hot-toast"

const ToasterNotify = () => {
    return (
        <Toaster
            position='top-center'
            toastOptions={{
                className: "",
            }}
        />
    )
}

export default ToasterNotify
