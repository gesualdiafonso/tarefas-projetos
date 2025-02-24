import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';

import { db } from '@/services/firebaseConnections';
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc} from 'firebase/firestore';
import Textarea from '@/components/textArea';
import { FaTrash } from 'react-icons/fa'

interface TaskProps{
    item: {
        tarefas: string;
        created: string;
        public: boolean;
        user: string;
        taskId: string;
    }
    allComments: CommentsProps[]
}

interface CommentsProps{
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession()

    const [ input, setInput ] = useState("")
    const [comments, setComments] = useState<CommentsProps[]>(allComments || [])

    async function handleComment(event: FormEvent) {
        event.preventDefault()

        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            };

            setComments((oldItem) => [...oldItem, data])
            setInput("")
        }catch(err){
            console.log(err)
        }
    }

    async function handleDeletComment(id: string){
        try{
            const docRef = doc(db, "comments", id)
            await deleteDoc(docRef);

            const deletComment = comments.filter( (item) => item.id !== id)

            setComments(deletComment)
            
        }catch(err){
            console.log(err)
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Detalhes da Tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefas</h1>
                <article className={styles.task}>
                    <p>
                        {item.tarefas}
                    </p>
                </article>

                <section className={styles.commentsContenainer}>
                    <h2>Deixar comentario</h2>

                    <form onSubmit={handleComment}>
                        <Textarea 
                            value={input}
                            onChange={ (event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value) }
                            placeholder='Digite seu comentario'
                        />
                        <button 
                            disabled={!session?.user}
                            className={styles.button}>
                                Enviar Comentario
                        </button>
                    </form>
                </section>

                <section className={styles.commentsContainer}>
                    <h2>Todos os Comentarios</h2>
                    {comments.length === 0 && (
                        <span>Nenhu comentário foi exibido nessa tarefa</span>
                    )}

                    {comments.map((item) => (
                        <article key={item.id} className={styles.comments}>
                            <div className={styles.headComment}>
                                <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeletComment(item.id)}>
                                    <FaTrash  size={18} color='#ea3140'/>
                                </button>
                            )}

                            </div>
                            <p>{item.comment}</p>
                        </article>
                    ))}

                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "task", id);

    const q = query(collection(db, "comments"), where('taskId', "==", id));

    const snapshotComments = await getDocs(q)

    let allComments:CommentsProps[] = [];

    snapshotComments.forEach((doc) =>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })

    const snapshot = await getDoc(docRef);
    
    if(snapshot.data() === undefined) {
        return{
            redirect: {
                destination: "/",
                permanent: false,
            }
        };
    }

    if(!snapshot.data()?.public) {
        return{
            redirect: {
                destination: "/",
                permanent: false,
            }
        };
    }

    const miliseconds = snapshot.data()?.created?.sedonds * 1000;

    const task ={
        tarefas: snapshot.data()?.tarefas, 
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    };

    return{
        props: {
            item: task,
            allComments: allComments,
        }
    };
};