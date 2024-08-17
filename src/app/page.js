"use client"
import styles from './page.module.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const accessToken = Cookies.get('accessToken');
  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    } else {
      router.push('/tasks');
    }
  }, [accessToken]);
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Test Task</p>
      </div>
    </main>
  );
}
