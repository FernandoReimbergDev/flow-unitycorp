import Image from "next/image";
import Logo from './assets/emblema.svg'

export function Header() {
    return (
        <header className="w-full px-8 py-2 shadow-xl fixed z-10 bg-white">
            <div className="w-8 h-8 xl:w-8 xl:h-8">
                <Image src={Logo} alt="Emblema unity brindes" className="h-full w-full" />
            </div>
        </header>
    )
}