import { GetStaticProps } from "next";
import Image from "next/image";
import styles from "../../src/styles/page.module.css";

import heroImg from "../../public/assets/hero.png";
import Head from "next/head";

import { db } from "../services/firebaseConnections"
import { collection, getDocs } from "firebase/firestore";

interface HomeProps{
  post: number;
  comments: number;
}

export default function Home({ post, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>EiTarefas | Organize suas tarefas</title>
        <meta name="description" content="Gerenciador de tarefas" />
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            src={heroImg}
            alt="Logo EiTarefas"
            priority
          />
        </div>
          <h2 className={styles.title}>Sistema feito para organizar <br /> suas tarefas e estudos</h2>
          <div className={styles.infoContent}>
              <section className={styles.box}>
                  <span>+{post} post</span>
              </section>
              <section className={styles.box}>
                  <span>+{comments} comentários</span>
              </section>

          </div>
      </main>
    </div>
  );
}


export const getStaticProps: GetStaticProps = async () => {
  // buscar do banco os numeros e mandar pro componente
  const commentRef = collection(db, "comments")
  const postRef= collection(db, "task")

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return{
    props: {
      post: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60, // seria revalidade a cada 60 s
  }
}