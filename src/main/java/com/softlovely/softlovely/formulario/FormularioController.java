package com.softlovely.softlovely.formulario;

import com.softlovely.softlovely.images.ImagesModel;
import com.softlovely.softlovely.images.ImagesRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
@RequestMapping("/formularios")
public class FormularioController {

    private final FormularioService formularioService;

    private final ImagesRepository imagesRepository;

    public FormularioController(FormularioService formularioService, ImagesRepository imagesRepository) {
        this.formularioService = formularioService;
        this.imagesRepository = imagesRepository;
    }

    @GetMapping("/novo")
    public String exibirFormulario(Model model) {
        model.addAttribute("formularioModel", new FormularioModel());
        return "formulario";
    }

    // Salvar formulário
    @PostMapping("/salvar")
    public String salvarFormulario(
            @ModelAttribute("formularioModel") FormularioModel formularioModel,
            @RequestParam("imagem") MultipartFile imagem
    ) {
        try {
            // Salva o formulário
            FormularioModel salvo = formularioService.salvar(formularioModel);

            // Se o usuário enviou uma imagem
            if (!imagem.isEmpty()) {
                // Define onde salvar os arquivos (pasta local por enquanto)
                String uploadDir = "uploads/";
                File uploadFolder = new File(uploadDir);
                if (!uploadFolder.exists()) {
                    uploadFolder.mkdirs();
                }

                // Nome do arquivo único
                String fileName = salvo.getUserId() + "_" + imagem.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, imagem.getBytes());

                // Cria registro da imagem no banco
                ImagesModel img = new ImagesModel();
                img.setFormularioModel(salvo);
                img.setImagePath(filePath.toString());

                // salva no banco
                imagesRepository.save(img);
            }

            return "redirect:/formularios/listar";
        } catch (IOException e) {
            e.printStackTrace();
            return "redirect:/formularios/novo?erro=upload";
        }
    }


    @GetMapping("/listar")
    public String listar(Model model) {
        model.addAttribute("formularios", formularioService.listarTodos());
        return "listar-formularios";
    }

    // Detalhe individual (pode ser usado para página do presente)
    @GetMapping("/{id}")
    public String visualizar(@PathVariable Long id, Model model) {
        model.addAttribute("formulario", formularioService.buscarPorId(id).orElseThrow());
        return "visualizar-formulario";
    }
}
