package com.softlovely.softlovely.images;

import com.softlovely.softlovely.formulario.FormularioModel;
import jakarta.persistence.*;

@Entity
@Table(
        name ="tb_imagens"
)
public class ImagesModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "userId")
    private FormularioModel formularioModel;

    @Column(name = "image_path")
    private String imagePath;


    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    public FormularioModel getFormularioModel() {
        return formularioModel;
    }

    public void setFormularioModel(FormularioModel formularioModel) {
        this.formularioModel = formularioModel;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}
