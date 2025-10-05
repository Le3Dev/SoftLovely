package com.softlovely.softlovely.formulario;


import com.softlovely.softlovely.images.ImagesModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "tb_formulario")
public class FormularioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank(message = "Nome não pode estar vazio!")
    @Size(min = 3, max=100 , message = "Nome deve ter entre 3 e 100 caracteres.")
    private String nomeAcompanhante;

    private String musica;

    @OneToMany(mappedBy = "formularioModel")
    private List<ImagesModel> images = new ArrayList<>();

    @NotNull(message = "Data não pode estar vazia!")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date dataDeInicio;



    public FormularioModel (){

    }
    public void setImages(List<ImagesModel> images) {
        this.images = images;
    }

    public void setMusica(String musica) {
        this.musica = musica;
    }

    public void setDataDeInicio(Date dataDeInicio) {
        this.dataDeInicio = dataDeInicio;
    }

    public void setNomeAcompanhante(String nomeAcompanhante) {
        this.nomeAcompanhante = nomeAcompanhante;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }
}
