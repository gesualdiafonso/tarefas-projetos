
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            <span className={styles.ei}>Ei</span>
                            <span className={styles.tarefas}>Tarefas</span>
                        </h1>
                    </Link>

                    {session?.user && (
                        <Link href="/dashboard" className={styles.dashboard}>
                            Meu Painel
                        </Link>
                    )}
                </nav>

                {status === 'loading' ? (
                    <></>
                ) : session ? (
                    <button className={styles.btnLogIn} onClick={() => signOut()}>
                        Olá {session.user?.name}
                    </button>
                ) : (
                    <button className={styles.btnLogIn} onClick={() => signIn("google")}>
                        Acessar
                    </button>
                )}
            </section>
        </header>
    );
}
