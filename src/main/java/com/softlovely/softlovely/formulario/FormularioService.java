package com.softlovely.softlovely.formulario;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FormularioService {

    private final FormularioRepository formularioRepository;

    public FormularioService(FormularioRepository formularioRepository) {
        this.formularioRepository = formularioRepository;
    }

    public FormularioModel salvar(FormularioModel formulario) {
        return formularioRepository.save(formulario);
    }

    public List<FormularioModel> listarTodos() {
        return formularioRepository.findAll();
    }

    public Optional<FormularioModel> buscarPorId(Long id) {
        return formularioRepository.findById(id);
    }

    public void deletar(Long id) {
        formularioRepository.deleteById(id);
    }
}
