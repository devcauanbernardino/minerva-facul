package br.com.minerva.minerva.service;

import br.com.minerva.minerva.dto.BoletoRequest;
import br.com.minerva.minerva.dto.BoletoResponse;
import br.com.minerva.minerva.exception.RecursoNaoEncontradoException;
import br.com.minerva.minerva.model.Aluno;
import br.com.minerva.minerva.model.Boleto;
import br.com.minerva.minerva.repository.AlunoRepository;
import br.com.minerva.minerva.repository.BoletoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoletoService {

    private final BoletoRepository boletoRepository;
    private final AlunoRepository alunoRepository;

    @Transactional(readOnly = true)
    public List<BoletoResponse> listarPorAluno(Long alunoId) {
        return boletoRepository.findByAlunoId(alunoId)
            .stream()
            .map(this::paraResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<BoletoResponse> listarTodos() {
        return boletoRepository.findAll()
            .stream()
            .map(this::paraResponse)
            .toList();
    }

    @Transactional
    public BoletoResponse gerar(BoletoRequest request) {
        Aluno aluno = alunoRepository.findById(request.getAlunoId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado com id: " + request.getAlunoId()));

        Boleto boleto = new Boleto();
        boleto.setAluno(aluno);
        boleto.setValor(request.getValor());
        boleto.setVencimento(request.getVencimento());
        boleto.setReferencia(request.getReferencia());
        boleto.setStatus("PENDENTE");

        Boleto salvo = boletoRepository.save(boleto);
        return paraResponse(salvo);
    }

    @Transactional
    public BoletoResponse marcarComoPago(Long id) {
        Boleto boleto = buscarEntidade(id);
        boleto.setStatus("PAGO");
        boleto.setDataPagamento(LocalDate.now());

        Boleto salvo = boletoRepository.save(boleto);
        return paraResponse(salvo);
    }

    @Transactional(readOnly = true)
    public BoletoResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidade(id));
    }

    private Boleto buscarEntidade(Long id) {
        return boletoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Boleto não encontrado com id: " + id));
    }

    private BoletoResponse paraResponse(Boleto boleto) {
        BoletoResponse response = new BoletoResponse();
        response.setId(boleto.getId());
        response.setAlunoId(boleto.getAluno().getId());
        response.setAlunoNome(boleto.getAluno().getNome());
        response.setValor(boleto.getValor());
        response.setVencimento(boleto.getVencimento());
        response.setStatus(boleto.getStatus());
        response.setReferencia(boleto.getReferencia());
        response.setDataPagamento(boleto.getDataPagamento());
        return response;
    }
}
