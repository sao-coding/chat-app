type ContainerProps = {
    children: React.ReactNode
}

const Container = (props: ContainerProps) => {
    return <main className='mx-auto bg-slate-50 max-w-5xl px-1 h-full'>{props.children}</main>
}

export default Container
