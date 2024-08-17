import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import styles from './tasks.module.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const router = useRouter();

  const userId = parseInt(Cookies.get('userId'), 10);
  const accessToken = Cookies.get('accessToken');
  const userCvUrl = Cookies.get('cvUrl');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || !accessToken) {
        console.error('User ID or access token is missing');
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/tasks/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchTasks();
  }, [userId, accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = { title, description, userId };
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    if (response.ok) {
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setTitle('');
      setDescription('');
    }
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userId');
    Cookies.remove('cvUrl');
    router.push('/login');
  };

  const handleUploadCSV = () => {
    router.push('/upload-cv');
  };

  return (
    <div className={styles.container}>
      <h1>Your Tasks</h1>
      <div className={styles.routingButtons}>
        <div>
          {userCvUrl && (
            <a
              href={userCvUrl}
              target="_blank"
              className={styles.uploadCVButton2}
            >
              view Cv
            </a>
          )}
          <button onClick={handleUploadCSV} className={styles.uploadCVButton}>
            {userCvUrl ? 'Update' : 'Upload'} CV
          </button>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Task Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Create Task
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
