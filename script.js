document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素获取
    const form = document.getElementById('cloneForm');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const audioFile = document.getElementById('audioFile');
    const sampleText = document.getElementById('sampleText');
    const cloneText = document.getElementById('cloneText');

    /**
     * 将音频文件转换为 base64 格式
     * @param {File} file - 音频文件对象
     * @returns {Promise<string>} base64编码的字符串
     */
    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // 移除 base64 字符串中的文件类型前缀
                const base64String = reader.result
                    .replace('data:audio/wav;base64,', '')
                    .replace('data:audio/mpeg;base64,', '')
                    .replace('data:audio/mp3;base64,', '');
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * 调用 Whisper API 进行语音识别
     * @param {string} audioBase64 - base64编码的音频数据
     * @param {string} whisperId - Whisper API ID
     * @param {string} whisperKey - Whisper API Key
     * @returns {Promise<string>} 识别出的文本
     */
    async function callWhisperAPI(audioBase64, whisperId, whisperKey) {
        // 发送请求到 Whisper API
        const response = await fetch(`https://api-serverless.datastone.cn/v1/${whisperId}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${whisperKey}`
            },
            body: JSON.stringify({
                input: {
                    audio_base64: audioBase64
                }
            })
        });

        // 记录响应日志
        console.log('Whisper API 响应:', response);
        const data = await response.json();
        console.log('Whisper API 返回数据:', data);

        // 解析并返回识别结果
        if (data && data.transcription) {
            return decodeURIComponent(JSON.parse('"' + data.transcription.replace(/\"/g, '\\"') + '"'));
        }
        return '';
    }

    /**
     * 调用 Cosyvoice API 进行语音克隆
     * @param {string} outputText - 目标文本
     * @param {string} originAudioText - 原始音频文本
     * @param {string} audioBase64 - base64编码的音频数据
     * @param {string} cosyvoiceId - Cosyvoice API ID
     * @param {string} cosyvoiceKey - Cosyvoice API Key
     * @returns {Promise<string>} 生成的音频数据的 base64 字符串
     */
    async function callCosyvoiceAPI(outputText, originAudioText, audioBase64, cosyvoiceId, cosyvoiceKey) {
        // 构建请求数据
        const prompt = JSON.stringify({
            output_text: outputText,
            origin_audio_text: originAudioText,
            audio_base64: audioBase64
        });

        // 发送请求到 Cosyvoice API
        const response = await fetch(`https://api-serverless.datastone.cn/v1/${cosyvoiceId}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cosyvoiceKey}`
            },
            body: JSON.stringify({
                input: {
                    prompt: prompt
                }
            })
        });

        // 解析响应数据
        const data = await response.json();
        console.log('Cosyvoice API 响应:', data);

        // 解析返回的 JSON 数据
        let parsedOutput;
        try {
            parsedOutput = JSON.parse(data);
            console.log('解析后的数据:', parsedOutput);
        } catch (error) {
            console.error('JSON 解析失败:', error);
            throw new Error('响应数据格式错误');
        }

        // 记录音频数据信息
        console.log('音频数据对象:', parsedOutput.data);
        console.log('音频 base64 数据:', parsedOutput.data.audio_base64);

        // 检查并处理音频数据
        if (parsedOutput?.data?.audio_base64) {
            const audioBase64 = parsedOutput.data.audio_base64;
            console.log('收到音频数据, 长度:', audioBase64.length);
            // 触发音频下载
            downloadAudio(audioBase64);
            return audioBase64;
        } else {
            console.error('未接收到音频数据');
            alert('未收到音频文件');
            return '';
        }
    }

    /**
     * 下载 base64 格式的音频文件
     * @param {string} base64Data - base64编码的音频数据
     */
    function downloadAudio(base64Data) {
        const link = document.createElement('a');
        link.href = `data:audio/wav;base64,${base64Data}`;
        link.download = `clone_audio_${Date.now()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 转写按钮点击事件处理
    transcribeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('点击转写按钮');
        
        try {
            // 验证音频文件
            const file = audioFile.files[0];
            if (!file) {
                alert('请先选择音频文件');
                return;
            }

            // 验证 API 凭证
            const whisperId = document.getElementById('whisperId').value;
            const whisperKey = document.getElementById('whisperKey').value;
            if (!whisperId || !whisperKey) {
                alert('请填写 Whisper ID 和 Key');
                return;
            }

            // 执行转写操作
            const base64String = await fileToBase64(file);
            const text = await callWhisperAPI(base64String, whisperId, whisperKey);
            sampleText.value = text;
        } catch (error) {
            console.error('转写失败:', error);
            alert('转写失败，请检查网络连接和 API 密钥');
        }
    });

    // 表单提交事件
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const whisperId = document.getElementById('whisperId').value;
            const whisperKey = document.getElementById('whisperKey').value;
            const cosyvoiceId = document.getElementById('cosyvoiceId').value;
            const cosyvoiceKey = document.getElementById('cosyvoiceKey').value;
            const file = audioFile.files[0];

            if (!file) {
                alert('请选择音频文件');
                return;
            }

            let originAudioText = sampleText.value;
            const audioBase64 = await fileToBase64(file);

            // 如果示例音频文案为空，先调用Whisper API
            if (!originAudioText) {
                originAudioText = await callWhisperAPI(audioBase64, whisperId, whisperKey);
                sampleText.value = originAudioText;
            }

            const outputText = cloneText.value;
            
            // 调用Cosyvoice API
            const result = await callCosyvoiceAPI(
                outputText,
                originAudioText,
                audioBase64,
                cosyvoiceId,
                cosyvoiceKey
            );

            // 下载生成的音频
            downloadAudio(result.audio_base64);
        } catch (error) {
            console.error('处理失败:', error);
            alert('处理失败,请检查网络连接和API密钥');
        }
    });
}); 