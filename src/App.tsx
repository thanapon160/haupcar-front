import { useState, useEffect } from 'react'
import './App.css'
import { Card, List, Button, Modal } from 'antd';
import { useForm } from "react-hook-form"
import axios from './config/axios'

interface ICar {
  id: string;
  license: string;
  brand: string;
  series: string;
  remark?: string;
}

enum action {
  CREATE = 'create',
  EDIT = 'edit'
}

function App() {
  const [carList, setCarList] = useState<ICar[]>([])
  const [selectedCar, setSelectedCar] = useState<ICar>({
    id: '',
    license: '',
    brand: '',
    series: '',
    remark: ''
  })
  const [mode, setMode] = useState<action>(action.CREATE)

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      car: {
        id: '',
        license: '',
        brand: '',
        series: '',
        remark: ''
      }
    }
  })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getCarList = async () => {
    try {
      const res = await axios.get('/car')
      setCarList(res.data)
    } catch (err) {
      console.dir(err)
    }
  }

  useEffect(() => {
    getCarList();
  }, []);

  const handleAdd = () => {
    setMode(action.CREATE)
    reset();
    setIsModalOpen(true)
  }
  const handleEdit = (car: ICar) => {
    setMode(action.EDIT)
    setValue("car", {
      id: car.id,
      license: car.license,
      brand: car.brand,
      series: car.series,
      remark: car.remark || ''
    })
    setIsModalOpen(true)
  }
  const handleDelete = (car: ICar) => {
    setSelectedCar(car)
    setIsDeleteModalOpen(true)
  }

  const onSubmit = async (data: { car: ICar }) => {
    if (mode === action.CREATE) {
      await axios.post('/car', data.car)
    } else {
      await axios.patch(`/car/${data.car.id}`, data.car)
    }
    setIsModalOpen(false)
    await getCarList();
  }
  const onDelete = async () => {
    await axios.delete(`/car/${selectedCar.id}`);
    setIsDeleteModalOpen(false)
    await getCarList();
  }

  const grid = {
    gutter: 16,
  }

  return (
    <>
      <Button className='add-btn' onClick={handleAdd}>Add</Button>
      <List
        grid={grid}
        dataSource={carList}
        renderItem={(item) => (
          <List.Item>
            <Card title={item.brand} className='car-card'>
              <section className='flex car-content'>
                <p>
                  License: { item.license }
                </p>

                <p>
                  Series: { item.series }
                </p>

                <p>
                  Remark: { item.remark || '-' }
                </p>
              </section>

              <section className='flex action-btn'>
                <Button onClick={() => handleEdit(item)}>Edit</Button>
                <Button onClick={() => handleDelete(item)}>Delete</Button>
              </section>
            </Card>
          </List.Item>
        )}
      />

      {/* add modal */}
      <Modal
        title="Add car"
        open={isModalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={() => setIsModalOpen(false)}
      >
        <form className='flex add-form'>
          <label>License</label>
          <input {...register('car.license', { required: 'This is required' })}></input>
          <span className='error-text'>{errors.car?.license?.message}</span>

          <label>Brand</label>
          <input {...register('car.brand', { required: 'This is required' })}></input>
          <span className='error-text'>{errors.car?.brand?.message}</span>

          <label>Series</label>
          <input {...register('car.series', { required: 'This is required' })}></input>
          <span className='error-text'>{errors.car?.series?.message}</span>

          <label>Remark</label>
          <input {...register('car.remark')}></input>
        </form>
      </Modal>

      {/* delete modal */}
      <Modal
        title="Comfirm Delete"
        open={isDeleteModalOpen}
        onOk={onDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}

export default App
