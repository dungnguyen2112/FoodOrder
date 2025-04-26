package com.example.cosmeticsshop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.ArrayList;
import com.example.cosmeticsshop.domain.request.ChatGPTRequest;
import com.example.cosmeticsshop.domain.response.ChatGPTResponse;
import com.example.cosmeticsshop.domain.response.PromptDTO;

@Service
public class ChatGPTService {

    private final RestClient restClient;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.model}")
    private String model;

    public ChatGPTService(RestClient restClient) {
        this.restClient = restClient;
    }

    public String getChatResponse(PromptDTO userInput) {
        // Create a list for messages
        List<ChatGPTRequest.Message> messages = new ArrayList<>();

        // Add a system message to restrict responses to food-related topics
        messages.add(new ChatGPTRequest.Message("system",
                "Bạn là một trợ lý ảo chuyên về ẩm thực và đồ ăn. " +
                        "Chỉ trả lời những câu hỏi liên quan đến thực phẩm, đồ ăn, công thức nấu ăn, " +
                        "nhà hàng, đặc sản vùng miền, cách chế biến, nguyên liệu, và các chủ đề liên quan đến ẩm thực. "
                        +
                        "Nếu người dùng hỏi về chủ đề không liên quan đến đồ ăn hoặc ẩm thực, " +
                        "hãy lịch sự từ chối và gợi ý họ hỏi về các chủ đề liên quan đến đồ ăn. " +
                        "Cung cấp câu trả lời ngắn gọn, thân thiện và hữu ích."));

        // Add the user's message
        messages.add(new ChatGPTRequest.Message("user", userInput.prompt()));

        ChatGPTRequest request = new ChatGPTRequest(
                model,
                messages);

        ChatGPTResponse response = restClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(request)
                .retrieve()
                .body(ChatGPTResponse.class);

        return response.choices().get(0).message().content();
    }
}