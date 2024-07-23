import React from 'react'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const ProductosSeleccionados = ({ selectedProducts, handleDeleteProduct, handleQuantityChange }) => {
  return (
    <div className="absolute top-36 right-2.5 w-1/2">
      <TableContainer component={Paper} style={{ maxHeight: '500px', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Producto</TableCell>
              <TableCell>Código de Barras</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedProducts.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.price}$</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    inputProps={{ min: "1", step: "1" }}
                    size="small" // Tamaño pequeño
                    style={{ width: '60px' }} // Ancho personalizado
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    style={{ backgroundColor: 'red' }}
                    onClick={() => handleDeleteProduct(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default ProductosSeleccionados
