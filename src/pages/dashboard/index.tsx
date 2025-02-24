
import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import styles from './styles.module.css';
import Head from 'next/head';

import { getSession } from 'next-auth/react';
import { redirect } from 'next/dist/server/api-utils';
import Textarea from '@/components/textArea';

import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa';

import { db } from '../../services/firebaseConnections'

import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link';

interface DashboardProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string,
    created: Date,
    public: boolean,
    tarefas: string,
    user: string
}

export default function Dashboard({ user }: DashboardProps) {

    const [ input, setInput ] = useState("")
    const [publicTask, setPublicTask] = useState(false)
    const [tarefas, setTask] = useState<TaskProps[]>([])

    useEffect(() =>{
        async function loadTask(){
            
            const taskRef = collection(db, "task")
            const q = query(
                taskRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            );

            onSnapshot(q, (snapchot) => {
                console.log(snapchot);
                let list = [] as TaskProps[];

                snapchot.forEach((doc) =>{
                    list.push({
                        id: doc.id,
                        tarefas: doc.data().tarefas,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })

                setTask(list)
            });
        }

        loadTask()
    }, [user?.email])

    function handleChangePublic (event:ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleRegistrerTask (event:FormEvent) {
        event.preventDefault();

        if(input === '') return;

        try{
            await addDoc(collection(db, "task"), {
                tarefas: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            });

            setInput("")
            setPublicTask(false)
        }catch(err){
            console.log(err)
        }
    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )
        alert("URL copiado!")
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "task", id)
        await deleteDoc(docRef)
    }

    return(
        <>
            <Head>
                <title>Meu Painel de Tarefas</title>
                <meta name="description" content="Meu painel de tarefas" />
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                            <form onSubmit={handleRegistrerTask}>
                                <Textarea 
                                    placeholder='Digite qual a sua tarefa'
                                    value={input}
                                    onChange={ (event:ChangeEvent<HTMLTextAreaElement>) => 
                                        setInput(event.target.value) }
                                />
                                <div className={styles.checkBoxAre}>
                                    <input type="checkbox" 
                                            className={styles.checkbox}
                                            checked={publicTask}
                                            onChange={handleChangePublic}
                                    />
                                    <label > Deixar tarefa publica</label>
                                </div>

                                <button type='submit' className={styles.button}>
                                    Registrar
                                </button>
                            </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h2>Minhas Tarefas</h2>

                    {tarefas.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PUBLICO</label>
                                    <button className={styles.shareBtn} onClick={() => handleShare(item.id)}>
                                        <FiShare2
                                            size={22}
                                            color='#00ccff'
                                        />
                                    </button>
                                </div>
                            )}
                            <div className={styles.taskContent}>
                                
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefas}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefas}</p>
                                )}
                                <button className={styles.trashBtn} onClick={ () => handleDeleteTask(item.id) }>
                                    <FaTrash 
                                        size={24}
                                        color='#ea3140'
                                    />
                                </button>
                            </div>
                    </article>
                    ))}

                </section>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ( { req } ) => {

    const session = await getSession({ req })

    if(!session?.user){
        // Se não tem retorna para home
        return{
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    };
    return{
        props: {
            user: {
                email: session?.user?.email,
            }
        }
    }
}