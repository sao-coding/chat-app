import { IconUser } from "@tabler/icons-react"
import clsx from "clsx"

const Loading = ({ index }: { index: number }) => {
    return (
        <div
            className={clsx(
                "flex flex-col mb-2 animate-pulse",
                index % 2 === 0 ? "items-end" : "items-start"
            )}
        >
            <div className='flex items-center px-1 py-1'>
                <div className='w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center'>
                    <IconUser size={24} />
                </div>

                {/* <div className='ml-1 bg-slate-200 w-14 h-4 rounded-full'></div> */}
            </div>
            <div className='border rounded-2xl bg-white p-2 max-w-xl break-words whitespace-pre-line w-40 h-10'></div>
            {/* <div className='m-1 bg-slate-200 w-28 h-3 rounded-full'></div> */}
        </div>
    )
}

export default Loading
